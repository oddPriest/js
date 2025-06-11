from django.contrib import admin
from .models import Application, Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'clock_in', 'clock_out', 'break_start', 'break_end')
    search_fields = ('user__username', 'date')


class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'category', 'at_date', 'status', 'created_at')  
    list_filter = ('status', 'category', 'created_at')  
    search_fields = ('user__username', 'description')  
    ordering = ('-created_at',)
    list_per_page = 20  

    actions = ['mark_as_approved', 'mark_as_rejected']

    @admin.action(description="選択した申請を承認済みにする")
    def mark_as_approved(self, request, queryset):
        queryset.update(status='approved')

    @admin.action(description="選択した申請を却下する")
    def mark_as_rejected(self, request, queryset):
        queryset.update(status='rejected')


admin.site.register(Application, ApplicationAdmin)
