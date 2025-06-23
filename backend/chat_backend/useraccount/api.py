from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from .serializers import UserDetailsSerializer
from .models import User
from django.db.models import Q, Value
from django.db.models.functions import Concat


@api_view(["GET"])
def userDetails(request, pk):
    user = User.objects.get(pk=pk)
    serializer = UserDetailsSerializer(user, many=False, context={"request": request})

    return JsonResponse(serializer.data, safe=False)


@api_view(["GET"])
def get_users(request):
    query = request.GET.get("query", "")
    user = (
        User.objects.annotate(
            annotated_full_name=Concat("first_name", Value(" "), "last_name")
        )
        .filter(
            Q(email__icontains=query)
            | Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
            | Q(annotated_full_name__icontains=query)
        )
        .exclude(id=request.user.id)
    )
    serializer = UserDetailsSerializer(user, many=True, context={"request": request})
    return JsonResponse(serializer.data, safe=False)


@api_view(["PATCH", "PUT"])
def upload_avatar(request):
    avatar = request.FILES.get("avatar")
    user = request.user
    if not avatar:
        return JsonResponse({"success": False, "error": "No file uploaded"}, safe=False)
    user.avatar = avatar
    user.save()
    return JsonResponse({"success": True}, safe=False)
