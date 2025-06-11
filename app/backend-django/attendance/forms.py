from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.utils.translation import gettext_lazy as _
from django import forms
from .models import Application



class CustomLoginForm(AuthenticationForm):
    username = forms.CharField(
        label=_("ユーザー名"),
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'ユーザー名',
            'autofocus': True,
        })
    )
    password = forms.CharField(
        label=_("パスワード"),
        strip=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'パスワード',
        }),
    )

class ApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = ['at_date','category', 'description']
        labels = {
            'at_date': '該当日時',
            'category': '種別',
            'description': '内容',
        }
        widgets = {
            'at_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
        }
