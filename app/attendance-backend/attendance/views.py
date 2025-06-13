from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.core.paginator import Paginator
from django.utils.timezone import now
from django.contrib.auth.views import LoginView
from .models import Attendance
from .forms import CustomLoginForm
from .forms import ApplicationForm
from .models import Application
from django.contrib.auth import logout


class CustomLoginView(LoginView):
    template_name = 'login.html'
    authentication_form = CustomLoginForm

@api_view(['POST'])
def attendance_create(request):
    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@login_required
def dashboard_attendance(request):
    user = request.user
    attendance, created = Attendance.objects.get_or_create(user=user, date=now().date())

    if request.method == "POST":
        action = request.POST.get("action")
        if action == "clock_in" and not attendance.clock_in:
            attendance.clock_in = now()
        elif action == "break_start" and not attendance.break_start:
            attendance.break_start = now()
        elif action == "break_end" and not attendance.break_end:
            attendance.break_end = now()
        elif action == "clock_out" and not attendance.clock_out:
            attendance.clock_out = now()
        else:
            # エラー処理
            return render(request, "attendance/dashboard.html", {
                "user": user,
                "attendance": attendance,
                "error": "無効な操作または既に登録済みです。"
            })

        attendance.save()

    return render(request, "attendance/dashboard.html", {
        "user": user,
        "attendance": attendance,
    })

@login_required
def attendance_history(request):
    user = request.user
    attendance_records = Attendance.objects.filter(user=user).order_by('-date')
    paginator = Paginator(attendance_records, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
    }
    return render(request, 'attendance/history.html', context)


@staff_member_required
def edit_attendance(request, pk):
    attendance = get_object_or_404(Attendance, pk=pk)

    if request.method == 'POST':
        attendance.clock_in = request.POST.get('clock_in')
        attendance.break_start = request.POST.get('break_start')
        attendance.break_end = request.POST.get('break_end')
        attendance.clock_out = request.POST.get('clock_out')
        attendance.save()
        return redirect('attendance_history')

    context = {
        'attendance': attendance,
    }
    return render(request, 'attendance/edit_attendance.html', context)

@login_required
def application_form(request):
    if request.method == 'POST':
        form = ApplicationForm(request.POST)
        if form.is_valid():
            application = form.save(commit=False)
            application.user = request.user  # ログインユーザーを関連付け
            application.save()
            return redirect('application_list')  # 申請一覧ページにリダイレクト
    else:
        form = ApplicationForm()

    return render(request, 'attendance/application_form.html', {'form': form})


@login_required
def application_list(request):
    # ログインユーザーの申請一覧を取得
    applications = Application.objects.filter(user=request.user).order_by('-created_at')
    context = {
        'applications': applications,
    }
    return render(request, 'attendance/application_list.html', context)

def custom_logout(request):
    logout(request)
    request.session.flush() 
    return redirect('login')
