from rest_framework.views import APIView
from django.http import JsonResponse


class TestAPIView(APIView):
    permission_classes = []

    def get(self, request):
        return JsonResponse({"message": "It's api work!"})
