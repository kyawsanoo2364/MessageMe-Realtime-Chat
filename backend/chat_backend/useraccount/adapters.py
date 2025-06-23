from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.models import SocialAccount
import requests
from django.core.files.base import ContentFile


class CustomGoogleOAuth2Adapter(GoogleOAuth2Adapter):
    def complete_login(self, request, app, token, response, **kwargs):

        login = super().complete_login(request, app, token, response, **kwargs)
        extra_data = login.account.extra_data

        picture_url = extra_data.get("picture")

        if picture_url:
            try:
                image_response = requests.get(picture_url)
                if image_response.status_code == 200:
                    image_content = ContentFile(image_response.content)
                    login.user.avatar.save(
                        f"{login.user.id}-avatar.jpg", image_content, save=True
                    )
            except requests.RequestException as e:
                print(f"Failed to download avatar: {str(e)}")
        login.user.save()
        return login
