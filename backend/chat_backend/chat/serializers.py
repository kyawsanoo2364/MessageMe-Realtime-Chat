from rest_framework import serializers
from .models import Conversation, Message, MessageReaction
from useraccount.serializers import UserDetailsSerializer
from django.conf import settings


class MessageReactionSerializer(serializers.ModelSerializer):
    react_by = UserDetailsSerializer(many=False, read_only=True)

    class Meta:
        model = MessageReaction
        fields = ("id", "react", "react_by", "created_at")


class MessageSerializer(serializers.ModelSerializer):
    created_by = UserDetailsSerializer(many=False, read_only=True)
    reply_to = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            "id",
            "body",
            "created_by",
            "created_at",
            "modified_at",
            "reply_to",
            "photo_url",
            "seen_by",
            "reactions",
        )

    def get_reply_to(self, obj):
        if obj.reply_to:
            return {
                "id": obj.reply_to.id,
                "body": obj.reply_to.body,
                "photo_url": self.get_photo_url(obj.reply_to),
            }
        return None

    def get_reactions(self, obj):
        reactions = obj.reactions.all()
        if reactions:
            serializer = MessageReactionSerializer(reactions, many=True)
            return serializer.data
        return []

    def get_photo_url(self, obj):
        request = self.context.get("request")
        if obj.photo and request:
            return settings.MEDIA_SERVE_URL + obj.photo.url
        return None


class ConversationSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ("id", "members", "created_at", "messages", "modified_at")

    def get_members(self, obj):
        request = self.context.get("request")
        serializer = UserDetailsSerializer(
            obj.members.all(), many=True, context={"request": request}
        )
        return serializer.data

    def get_messages(self, obj):
        request = self.context.get("request")
        message = obj.messages.all().order_by("created_at")
        serializer = MessageSerializer(message, many=True, context={"request": request})
        return serializer.data


class ConversationsSerializer(serializers.ModelSerializer):
    message = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ("id", "members", "created_at", "message", "modified_at")

    def get_members(self, obj):
        request = self.context.get("request")
        serializer = UserDetailsSerializer(
            obj.members.all(), many=True, context={"request": request}
        )
        return serializer.data

    def get_message(self, obj):
        request = self.context.get("request")
        message = obj.messages.all().order_by("-created_at").first()
        if message:
            serializer = MessageSerializer(
                message, many=False, context={"request": request}
            )
            return serializer.data
        return None
