from rest_framework import serializers
from .models import CustomUser
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import LoginSerializer as DefaultLoginSerializer
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id", "username", "first_name", "last_name",
            "email", "role", "is_email_verified"
        ]


class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        self.cleaned_data = data 
        return self.cleaned_data

    def save(self, request):
        print("CustomRegisterSerializer is being used!")
        user = super().save(request)
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        user.save()
        return user


class CustomLoginSerializer(serializers.Serializer):

    username = serializers.CharField(required=True)
    password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # Try to authenticate with username
            user = authenticate(username=username, password=password)
            
            if not user:
                # Try to authenticate with email as username
                try:
                    # FIX: Get the user by email and check uniqueness
                    user_queryset = CustomUser.objects.filter(email=username)
                    
                    # Check if multiple users have this email (data integrity issue)
                    if user_queryset.count() > 1:
                        raise serializers.ValidationError(
                            'Multiple accounts found with this email. Please contact support.'
                        )
                    
                    # Get the single user with this email
                    if user_queryset.exists():
                        user_obj = user_queryset.first()
                        user = authenticate(username=user_obj.username, password=password)
                except CustomUser.DoesNotExist:
                    pass

            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include "username" and "password".')
        return attrs