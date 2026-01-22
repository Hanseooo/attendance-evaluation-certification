import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
from users.models import CustomUser
from django.template.loader import render_to_string
from django.conf import settings

def get_notification_recipients():
    return CustomUser.objects.filter(
        role="participant",
        email_notification_pref__enabled=True
    ).select_related("email_notification_pref")

def send_new_seminar_emails(seminar):
    recipients = get_notification_recipients()
    print("function called")
    if not recipients.exists():
        return

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    sender = {
        "name": settings.BREVO_SENDER_NAME,
        "email": settings.BREVO_SENDER_EMAIL,
    }

    for user in recipients:
        html = render_to_string("new_seminar_notif.html", {
            "user": user,
            "seminar": seminar,
            "site_name": "The Podium",
            "BASE_URL" : settings.BASE_URL,
        })

        email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": user.email, "name": user.get_full_name() or user.username}],
            sender=sender,
            subject=f"New Seminar: {seminar.title}",
            html_content=html,
        )

        try:
            api_instance.send_transac_email(email)
            print("email sent")
        except ApiException as e:
            print(f"Email failed for {user.email}: {e}")
