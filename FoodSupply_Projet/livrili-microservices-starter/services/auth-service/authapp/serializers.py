from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Account


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = [
            "username",
            "email",
            "password",
            "role",
            "national_id",
            "full_name",
            "phone_number",
            "address",
        ]

    def create(self, validated_data):
        return Account.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = Account.objects.filter(email=data["email"]).first()
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        user = authenticate(username=user.username, password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return user
