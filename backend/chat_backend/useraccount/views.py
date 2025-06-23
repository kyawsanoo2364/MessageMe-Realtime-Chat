from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from django.urls import reverse
import requests
from rest_framework import status
from urllib.parse import urljoin
from .adapters import CustomGoogleOAuth2Adapter
from django.core.files.base import ContentFile


class GoogleLogin(SocialLoginView):
    permission_classes = []
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.GOOGLE_OAUTH_CALLBACK_URL
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        data = request.data
        if "id_token" in data:
            data["access_token"] = data["id_token"]
        response = super().post(request, *args, **kwargs)

        # Now user is authenticated, it's safe to fetch image
        user = request.user
        if not user.avatar:
            picture_url = user.socialaccount_set.first().extra_data.get("picture")
            if picture_url:
                try:
                    image_response = requests.get(picture_url)
                    if image_response.status_code == 200:
                        image_content = ContentFile(image_response.content)
                        user.avatar.save(
                            f"{user.id}-avatar.jpg", image_content, save=True
                        )
                except Exception as e:
                    print("Image fetch error:", e)

        return response


class GoogleLoginCallback(APIView):
    permission_classes = []

    def get(self, request, *args, **kwargs):
        code = request.GET.get("code")
        if not code:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        token_endpoint_url = urljoin(
            request.build_absolute_uri("/"), reverse("google_login")
        )
        response = requests.post(url=token_endpoint_url, data={"access_token": code})

        return Response(response.json(), status=200)
