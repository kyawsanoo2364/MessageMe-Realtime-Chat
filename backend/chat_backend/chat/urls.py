from django.urls import path
from . import api

urlpatterns = [
    path("conversation/create/", api.create_conversation, name="create_conversation"),
    path(
        "<uuid:user_pk>/all-conversations/",
        api.get_all_conversations,
        name="api_all_conversations",
    ),
    path("conversation/<uuid:pk>/", api.get_conversation, name="api_conversation"),
    path("conversation/message/", api.create_message, name="conversation_message"),
    path("online-users/", api.get_online_users_list, name="api_get_online_users_list"),
    path(
        "conversation/<uuid:pk>/delete/",
        api.delete_conversation,
        name="api_delete_conversation",
    ),
    path(
        "conversation/<uuid:pk>/send_image/",
        api.send_image_message,
        name="api_conversation_image_send",
    ),
]
