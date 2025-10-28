# certificates/admin.py
from django.contrib import admin
from .models import CertificateTemplate, CertificateRecord


@admin.register(CertificateTemplate)
class CertificateTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'seminar',
        'template_dimensions',
        'name_font_size',
        'title_font_size',
        'default_used',
        'uploaded_at',
    ]
    list_filter = ['default_used', 'uploaded_at']
    search_fields = ['seminar__title']
    readonly_fields = ['uploaded_at', 'template_dimensions']
    
    fieldsets = (
        ('Seminar', {
            'fields': ('seminar', 'template_image', 'template_dimensions', 'default_used')
        }),
        ('Participant Name Settings', {
            'fields': (
                'name_x_percent',
                'name_y_percent',
                'name_font_size',
                'name_font',
                'name_color',
            )
        }),
        ('Seminar Title Settings', {
            'fields': (
                'title_x_percent',
                'title_y_percent',
                'title_font_size',
                'title_font',
                'title_color',
            )
        }),
        ('Metadata', {
            'fields': ('uploaded_at',)
        }),
    )

    def template_dimensions(self, obj):
        """Display template dimensions"""
        return f"{obj.template_width}×{obj.template_height}px"
    template_dimensions.short_description = "Dimensions"


@admin.register(CertificateRecord)
class CertificateRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'seminar', 'email', 'sent_at']
    list_filter = ['sent_at', 'seminar']
    search_fields = ['user__username', 'user__email', 'seminar__title', 'email']
    readonly_fields = ['sent_at']
    date_hierarchy = 'sent_at'