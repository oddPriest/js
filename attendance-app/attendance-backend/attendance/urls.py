from django.urls import path
from . import views
from .views import CustomLoginView
from .views import custom_logout

urlpatterns = [
    path('', CustomLoginView.as_view(), name='login'),
    path('login/', custom_logout, name='logout'), #ログアウト画面の実装中止のためログイン画面に遷移
    path('dashboard/', views.dashboard_attendance, name='dashboard'),
    path('history/', views.attendance_history, name='attendance_history'),
    path('edit/<int:pk>/', views.edit_attendance, name='edit_attendance'),
    path('application_form/', views.application_form, name='application_form'),
    path('application_list/', views.application_list, name='application_list'),
    path('add/', views.add_record),
    path('records/', views.get_records),
]
