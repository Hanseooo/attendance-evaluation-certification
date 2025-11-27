# backend/api/urls.py
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from users.views import CurrentUserView
from seminars.views import SeminarListCreateAPIView, SeminarDetailAPIView, PlannedSeminarAPIView, PlannedSeminarDetailAPIView
from attendance.views import generate_qr_code, record_attendance, download_qr_code
from users.views import CurrentUserView, ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path('user/', CurrentUserView.as_view(), name='current-user'),
    path('seminars/', SeminarListCreateAPIView.as_view(), name='seminars-list-create'),
    path('seminars/<int:pk>/', SeminarDetailAPIView.as_view(), name='seminars-detail'),
    path('planned-seminars/', PlannedSeminarAPIView.as_view(), name='planned-seminars'),
    path('planned-seminars/<int:pk>/', PlannedSeminarDetailAPIView.as_view(), name='planned-seminars-detail'),
    path('generate-qr/<int:seminar_id>/', generate_qr_code, name='generate_qr_code'),
    path('attendance/<int:seminar_id>/<str:action>/', record_attendance, name='record_attendance'),
    path("attendance/", include("attendance.urls")),
    path('download-qr/<int:seminar_id>/<str:action>/', download_qr_code, name='download_qr_code'),
    path("evaluations/", include("evaluation.urls")),
    path("certificates/", include("certificates.urls")),
    path('', include('certificates.urls')),

    path('user/', CurrentUserView.as_view(), name='current-user'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
] 
