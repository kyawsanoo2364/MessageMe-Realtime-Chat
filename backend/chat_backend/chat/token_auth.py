from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def get_user(token):
    from django.contrib.auth.models import AnonymousUser
    from useraccount.models import User

    try:
        t = AccessToken(token)
        user_id = t.payload.get("user_id")
        return User.objects.get(pk=user_id)
    except Exception as e:
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query = dict(x.split("=") for x in scope["query_string"].decode().split("&"))
        token = query.get("token")
        scope["user"] = await get_user(token)
        return await super().__call__(scope, receive, send)
