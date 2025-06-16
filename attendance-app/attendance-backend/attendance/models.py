# attendance/models.py
from django.db import models
from django.contrib.auth.models import User

class AttendanceRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10)  # "late", "absent", etc.
