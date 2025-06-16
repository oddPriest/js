from django.contrib.auth.models import User
from django.db import models
from django.utils.timezone import now


class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    break_start = models.DateTimeField(null=True, blank=True)
    break_end = models.DateTimeField(null=True, blank=True)
    date = models.DateField(default=now)

    def __str__(self):
        return f"{self.user.username} - {self.date}"


class Application(models.Model):
    class CategoryChoices(models.TextChoices):
        LEAVE_REQUEST = '休暇', '休暇申請'
        CORRECTION_REQUEST = '打刻訂正', '打刻訂正申請'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    at_date = models.DateField()  
    category = models.CharField(
        max_length=20,
        choices=CategoryChoices.choices,
        default=CategoryChoices.LEAVE_REQUEST,
        verbose_name="申請カテゴリー"
    )
    description = models.TextField(verbose_name="申請内容")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="申請日")
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', '保留中'),
            ('approved', '承認済み'),
            ('rejected', '却下済み'),
        ],
        default='pending',
        verbose_name="ステータス"
    )

    def __str__(self):
        return f"{self.get_category_display()} - {self.at_date} - {self.user.username}"

class AttendanceRecord(models.Model):
    username = models.CharField(max_length=100)
    date = models.DateField()
    status = models.CharField(max_length=20)  # late, early, absent, presentなど
    created_at = models.DateTimeField(auto_now_add=True)
    