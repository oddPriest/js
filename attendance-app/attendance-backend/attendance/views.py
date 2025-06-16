# attendance/views.py
from rest_framework import viewsets
from .models import Attendance
from .serializers import AttendanceSerializer
from rest_framework.permissions import AllowAny  # 認証なしにする例

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]  # 開発中は認証なしに
