from django.contrib import admin
from .models import EmailChangeRequest

@admin.register(EmailChangeRequest)
class EmailChangeRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'new_email', 'verification_code', 'created_at', 'expires_at', 'attempts', 'is_used']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__username', 'user__email', 'new_email']
    readonly_fields = ['verification_code', 'created_at', 'expires_at']