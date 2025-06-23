import os
import uuid
from django.db import models
from useraccount.models import User


class Conversation(models.Model):
    id = models.UUIDField(
        primary_key=True, editable=False, default=uuid.uuid4, unique=True
    )
    members = models.ManyToManyField(User, related_name="conversations")
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


class Message(models.Model):
    id = models.UUIDField(
        primary_key=True, editable=False, default=uuid.uuid4, unique=True
    )
    body = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    reply_to = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True
    )
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    seen_by = models.ManyToManyField(User, blank=True, related_name="seen_messages")
    photo = models.ImageField(upload_to="message", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def delete(self, *args, **kwargs):
        if self.photo and self.photo.path:
            if os.path.isfile(self.photo.path):
                os.remove(self.photo.path)
        return super().delete(*args, **kwargs)


class MessageReaction(models.Model):
    id = models.UUIDField(
        primary_key=True, editable=False, default=uuid.uuid4, unique=True
    )
    message = models.ForeignKey(
        Message, on_delete=models.CASCADE, related_name="reactions"
    )
    react = models.CharField(max_length=100)
    react_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "react", "react_by")
