import os
import json
import redis
from useraccount.models import User
from django.http import JsonResponse
from .models import Conversation, Message
from rest_framework.decorators import api_view
from .serializers import (
    ConversationSerializer,
    MessageSerializer,
    ConversationsSerializer,
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.files.base import ContentFile


@api_view(["POST"])
def create_conversation(request):
    data = json.loads(request.body)
    member2 = data.get("receiver_userId", "")
    if not member2:
        return JsonResponse({"message": "Receiver are required!"}, status=400)
    try:
        user2 = User.objects.get(pk=member2)
    except Exception as e:
        return JsonResponse({"message": "user not found"}, status=404)

    existConversation = Conversation.objects.filter(members__in=[user2.id]).filter(
        members__in=[request.user.id]
    )
    if len(existConversation) > 0:
        conversation = existConversation[0]
    else:
        conversation = Conversation.objects.create()
        conversation.members.add(request.user, user2)
    serializer = ConversationSerializer(
        conversation, many=False, context={"request": request}
    )
    channel_layer = get_channel_layer()
    if not existConversation:
        async_to_sync(channel_layer.group_send)(
            f"chat_{str(user2.id)}",
            {
                "type": "new_conversation",
                "conversation": ConversationSerializer(
                    conversation, many=False, context={"request": request}
                ).data,
            },
        )

        return JsonResponse(serializer.data, safe=False, status=201)
    return JsonResponse(serializer.data, safe=False, status=200)


@api_view(["GET"])
def get_all_conversations(request, user_pk):
    user = User.objects.get(pk=user_pk)
    conversations = user.conversations.all()
    serializer = ConversationsSerializer(
        conversations, many=True, context={"request": request}
    )
    return JsonResponse(serializer.data, safe=False)


@api_view(["GET"])
def get_conversation(request, pk):
    conversation = Conversation.objects.get(pk=pk)
    serializer = ConversationSerializer(
        conversation, many=False, context={"request": request}
    )
    return JsonResponse(serializer.data, safe=False)


@api_view(["POST"])
def create_message(request):
    data = json.loads(request.body)
    conversationId = data.get("conversation_id", "")
    userId = data.get("created_by", "")
    body = data.get("body", "")

    user = User.objects.get(pk=userId)
    conversation = Conversation.objects.get(pk=conversationId)
    message = Message.objects.create(
        body=body, conversation=conversation, created_by=user
    )
    serializer = MessageSerializer(message, many=False)
    return JsonResponse(serializer.data, safe=False, status=201)


@api_view(["GET"])
def get_online_users_list(request):
    r = redis.Redis()
    keys = r.keys("presence:user:*")
    user_ids = [(k.decode().split(":")[2]) for k in keys]
    return JsonResponse(user_ids, safe=False)


UPLOAD_PATH = "uploads/tmp/"


@api_view(["POST"])
def send_image_message(request, pk):
    chunk = request.FILES.get("chunk")
    is_last = request.POST.get("is_last")
    index = request.POST.get("index")
    filename = request.POST.get("filename")
    if not chunk:
        return JsonResponse(
            {"success": False, "error": "No Chunk Provided!"}, status=400, safe=False
        )
    try:
        conversation = Conversation.objects.get(pk=pk)
    except Conversation.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Conversation does not exists."},
            status=404,
            safe=False,
        )
    os.makedirs(UPLOAD_PATH, exist_ok=True)
    tmp_path = os.path.join(UPLOAD_PATH, f"{pk}_{filename}")

    with open(tmp_path, "ab") as f:
        for c in chunk.chunks():
            f.write(c)

    if is_last:

        with open(tmp_path, "rb") as f:
            photo_file = ContentFile(f.read(), name=filename)
            message = Message.objects.create(
                conversation=conversation, photo=photo_file, created_by=request.user
            )
        os.remove(tmp_path)
        serializer = MessageSerializer(
            message, many=False, context={"request": request}
        )
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{pk}",
            {
                "type": "chat_photo",
                "conversation_id": str(pk),
                "message": serializer.data,
            },
        )
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({"success": True, "chunk_index": index})


@api_view(["DELETE"])
def delete_conversation(request, pk):
    try:
        conversation = Conversation.objects.get(pk=pk)
    except:
        return JsonResponse(
            {"error": "Conversation is not found", "success": False},
            safe=False,
            status=400,
        )
    other_user = conversation.members.exclude(id=request.user.id).first()
    conversation.delete()
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"chat_{other_user.id}",
        {"type": "delete_conversation", "conversation_id": str(pk)},
    )
    return JsonResponse({"success": True}, safe=False, status=200)
