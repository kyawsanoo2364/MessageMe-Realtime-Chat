from django.urls import re_path
from . import consumer

websocket_urlpatterns = [
    re_path(r"ws/chat/$", consumer.ChatRoomConsumer.as_asgi()),
    re_path(r"ws/presence/$", consumer.PresenceConsumer.as_asgi()),
]
