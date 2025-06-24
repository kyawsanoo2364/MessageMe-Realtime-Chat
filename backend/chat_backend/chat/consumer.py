import os
import json
import aiohttp
import tempfile
import requests

from urllib.parse import urlparse
from django.core.files import File
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

# from .models import Message, Conversation, MessageReaction
import redis.asyncio as redis
from channels.db import database_sync_to_async
from .serializers import MessageReactionSerializer, MessageSerializer
from django.apps import apps
from django.conf import settings


class ChatRoomConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        await self.channel_layer.group_add(
            f"chat_{str(self.user.id)}", self.channel_name
        )
        await self.join_conversation_groups()

        await self.accept()

    async def disconnect(self, code):
        conversations = await self.get_user_conversations()
        await self.channel_layer.group_discard(
            f"chat_{str(self.user.id)}", self.channel_name
        )
        for conversation in conversations:
            group_name = f"chat_{conversation.id}"
            await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message")
        conversation_id = text_data_json.get("conversation_id")
        created_by = text_data_json.get("created_by")
        type = text_data_json.get("type")
        message_id = text_data_json.get("message_id")
        new_message = text_data_json.get("new_message")
        reply_to = text_data_json.get("reply_to")
        receiver_user_id = text_data_json.get("receiver_user_id")
        Message = self._get_message_model()
        Conversation = self._get_conversation_model()
        MessageReaction = self._get_message_reaction_model()
        if type == "chat_message":
            m = await self.save_message(conversation_id, message)

            await self.channel_layer.group_send(
                f"chat_{conversation_id}",
                {
                    "type": "chat_message",
                    "message": m.body,
                    "conversation_id": conversation_id,
                    "created_by": created_by,
                    "message_id": str(m.id),
                },
            )
        elif type == "photo_message":
            await self.handle_forward_photo_message(text_data_json)
        elif type == "typing":
            user = text_data_json["user"]
            await self.channel_layer.group_send(
                f"chat_{conversation_id}",
                {"type": "typing", "user": user, "conversation_id": conversation_id},
            )
        elif type == "edited_message":

            m = await database_sync_to_async(Message.objects.get)(pk=message_id)
            m.body = new_message
            await database_sync_to_async(m.save)()

            await self.channel_layer.group_send(
                f"chat_{conversation_id}",
                {
                    "type": "message_edited",
                    "message_id": message_id,
                    "new_message": new_message,
                    "conversation_id": conversation_id,
                    "created_by": created_by,
                },
            )

        elif type == "reply_message":

            photo_url = text_data_json.get("photo_url")
            m = await database_sync_to_async(Message.objects.get)(pk=reply_to)
            conversation = await database_sync_to_async(Conversation.objects.get)(
                pk=conversation_id
            )
            new_m = await database_sync_to_async(Message.objects.create)(
                body=message,
                conversation=conversation,
                created_by=self.scope["user"],
                reply_to=m,
            )

            await self.channel_layer.group_send(
                f"chat_{conversation_id}",
                {
                    "type": "reply_message",
                    "message_id": str(new_m.id),
                    "message": new_m.body,
                    "created_by": created_by,
                    "conversation_id": str(conversation_id),
                    "reply_to": {
                        "id": str(m.id),
                        "body": m.body,
                        "photo_url": photo_url,
                    },
                },
            )

        elif type == "delete_message":
            await self.delete_message_by_id(message_id)

            await self.channel_layer.group_send(
                f"chat_{conversation_id}",
                {"type": "delete_message", "message_id": message_id},
            )
        elif type == "seen_message":
            await self.handle_seen_message(text_data_json)
        elif type == "react_message":
            await self.handle_react_message(text_data_json)
        elif type == "join_conversation":
            await self.handle_join_conversation(text_data_json)

    async def handle_forward_photo_message(self, data):
        Conversation = self._get_conversation_model()
        Message = self._get_message_model()
        conversation_id = data.get("conversation_id")
        photo_url = data.get("photo_url")
        try:
            conversation = await database_sync_to_async(Conversation.objects.get)(
                pk=conversation_id
            )
        except Conversation.DoesNotExist as e:
            print(f"conversation does not exists: {e}")
            return

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(photo_url) as response:
                    if response.status != 200:
                        print(f"Failed to fetch photo: Status {response.status}")
                        return
                    tmp_path = None
                    with tempfile.NamedTemporaryFile(delete=False) as img_temp:
                        tmp_path = img_temp.name
                        img_temp.write(await response.read())
                        img_temp.flush()

                    def save_msg():
                        try:
                            message = Message.objects.create(
                                conversation=conversation, created_by=self.user
                            )
                            filename = os.path.basename(urlparse(photo_url).path)
                            with open(tmp_path, "rb") as f:
                                message.photo.save(filename, File(f), save=True)

                            return message
                        finally:
                            if tmp_path and os.path.exists(tmp_path):
                                os.unlink(tmp_path)

                    message = await sync_to_async(save_msg)()
                    serialized = await self.serialized_message(message)
                    await self.channel_layer.group_send(
                        f"chat_{conversation_id}",
                        {
                            "type": "chat_photo",
                            "message": serialized,
                            "conversation_id": conversation_id,
                        },
                    )
        except aiohttp.ClientError as e:
            print(f"Network error fetching: {e}")
        except Exception as e:
            print(f"Photo forward error: {e}")

    async def chat_photo(self, event):
        await self.send(text_data=json.dumps(event))

    async def new_conversation(self, event):

        await self.send(text_data=json.dumps(event))

    async def delete_conversation(self, event):
        await self.send(text_data=json.dumps(event))

    async def reply_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def delete_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def message_edited(self, event):
        await self.send(text_data=json.dumps(event))

    async def chat_message(self, event):
        message = event["message"]
        conversation_id = event["conversation_id"]
        created_by = event["created_by"]
        message_id = event["message_id"]
        await self.send(
            text_data=json.dumps(
                {
                    "type": "chat_message",
                    "message": message,
                    "conversation_id": conversation_id,
                    "created_by": created_by,
                    "message_id": message_id,
                }
            )
        )

    async def typing(self, event):

        await self.send(text_data=json.dumps(event))

    async def handle_join_conversation(self, data):
        conversation_id = data.get("conversation_id")
        await self.channel_layer.group_add(f"chat_{conversation_id}", self.channel_name)

    @sync_to_async
    def serialized_message(self, message):
        return MessageSerializer(message).data

    @sync_to_async
    def delete_message_by_id(self, message_id):
        Message = self._get_message_model()
        return Message.objects.get(pk=message_id).delete()

    @sync_to_async
    def save_message(self, conversation_id, message):
        user = self.scope["user"]
        Conversation = self._get_conversation_model()
        Message = self._get_message_model()
        conversation = Conversation.objects.get(pk=conversation_id)
        return Message.objects.create(
            body=message, conversation=conversation, created_by=user
        )

    @sync_to_async
    def get_user_conversations(self):
        return list(self.user.conversations.all())

    async def handle_react_message(self, data):
        message_id = data.get("message_id", "")
        conversation_id = data.get("conversation_id", "")
        react = data.get("react", "")
        Message = self._get_message_model()
        MessageReaction = self._get_message_reaction_model()

        try:
            message = await database_sync_to_async(Message.objects.get)(pk=message_id)
        except Message.DoesNotExist:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "error",
                        "error": f"Message is not found.",
                    }
                )
            )
            return

        # check if reaction is already with the same user and same reaction in message
        existingSameReaction = await database_sync_to_async(
            lambda: MessageReaction.objects.filter(
                message=message, react_by=self.user, react=react
            ).first()
        )()

        if existingSameReaction:
            await database_sync_to_async(existingSameReaction.delete)()

            await self.channel_layer.group_send(
                f"chat_{conversation_id}",
                {
                    "type": "reaction_removed",
                    "conversation_id": conversation_id,
                    "message_id": message_id,
                    "react_by_user_id": str(self.user.id),
                },
            )
        else:
            # check if user is already react with the same user and other reaction in message
            existingReaction = await database_sync_to_async(
                lambda: MessageReaction.objects.filter(
                    message=message, react_by=self.user
                ).first()
            )()

            if existingReaction:
                # change new reaction
                reaction = await self.update_reaction(existingReaction, react)
            else:
                # create new reaction in message
                reaction = await database_sync_to_async(MessageReaction.objects.create)(
                    message=message, react_by=self.user, react=react
                )

            serialized = await database_sync_to_async(
                lambda: MessageReactionSerializer(reaction).data
            )()

            await self.channel_layer.group_send(
                f"chat_{conversation_id}",
                {
                    "type": "reaction_added",
                    "message_id": message_id,
                    "conversation_id": conversation_id,
                    "reaction": serialized,
                },
            )

    async def reaction_added(self, event):
        await self.send(text_data=json.dumps(event))

    async def reaction_removed(self, event):
        await self.send(text_data=json.dumps(event))

    async def handle_seen_message(self, data):
        message_ids = data.get("message_ids", [])
        Message = self._get_message_model()
        conversation_id = data.get("conversation_id")
        for message_id in message_ids:
            try:
                message = await database_sync_to_async(Message.objects.get)(
                    pk=message_id
                )
                already_seen = await database_sync_to_async(
                    message.seen_by.filter(pk=self.user.id).exists
                )()
                if not already_seen:
                    await database_sync_to_async(message.seen_by.add)(self.user)

            except Message.DoesNotExist:
                continue
        await self.channel_layer.group_send(
            f"chat_{conversation_id}",
            {
                "type": "seen_message",
                "conversation_id": str(conversation_id),
                "message_ids": message_ids,
                "user_id": str(self.user.id),
            },
        )

    async def seen_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def join_conversation_groups(self):
        conversations = await self.get_user_conversations()
        for conversation in conversations:
            group_name = f"chat_{conversation.id}"
            await self.channel_layer.group_add(group_name, self.channel_name)

    def _get_message_model(self):
        return apps.get_model("chat", "Message")

    def _get_conversation_model(self):
        return apps.get_model("chat", "Conversation")

    def _get_message_reaction_model(self):
        return apps.get_model("chat", "MessageReaction")

    @sync_to_async
    def update_reaction(self, reaction, new_react):
        reaction.react = new_react
        reaction.save()
        return reaction


class PresenceConsumer(AsyncWebsocketConsumer):
    """Track User Online or Offline"""

    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return
        self.user = self.scope["user"]
        redis_Url = settings.REDIS_URL
        self.redis = await redis.from_url(redis_Url, decode_responses=True)
        await self.accept()

        await self.make_user_online()
        await self.channel_layer.group_send(
            "online_users",
            {"type": "user_status", "user_id": str(self.user.id), "status": "online"},
        )

        await self.channel_layer.group_add("online_users", self.channel_name)

    async def disconnect(self, code):
        await self.make_user_offline()
        await self.channel_layer.group_send(
            "online_users",
            {"type": "user_status", "user_id": str(self.user.id), "status": "offline"},
        )
        await self.redis.close()
        await self.channel_layer.group_discard("online_users", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get("type") == "ping":
            await self.make_user_online()

    async def user_status(self, event):
        await self.send(text_data=json.dumps(event))

    async def make_user_online(self):

        await self.redis.set(f"presence:user:{str(self.user.id)}", "online", ex=60)

    async def make_user_offline(self):

        await self.redis.delete(f"presence:user:{str(self.user.id)}")
