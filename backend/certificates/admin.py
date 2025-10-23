# certificates/admin.py
from django.contrib import admin
from .models import CertificateTemplate

@admin.register(CertificateTemplate)
class CertificateTemplateAdmin(admin.ModelAdmin):
    list_display = ("seminar", "uploaded_at", "centered")
    readonly_fields = ("uploaded_at",)
