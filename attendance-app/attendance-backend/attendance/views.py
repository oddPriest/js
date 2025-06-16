# attendance/views.py
from rest_framework import viewsets
from .models import AttendanceRecord
from .serializers import AttendanceSerializer
from rest_framework.permissions import IsAuthenticated

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
