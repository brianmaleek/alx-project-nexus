from rest_framework import serializers
from .models import Poll, Option, Vote
from django.contrib.auth.models import User
from django.db import transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username']

class OptionSerializer(serializers.ModelSerializer):
    vote_count = serializers.ReadOnlyField()
    vote_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Option
        fields = ['id', 'text', 'order', 'vote_count', 'vote_percentage']
        read_only_fields = ['id', 'vote_count', 'vote_percentage']

class PollListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    total_votes = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    option_count = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = [
            'id', 'title', 'description', 'created_by', 'created_at', 'expires_at', 'is_active', 'allow_multiple_votes', 'total_votes', 'is_expired', 'option_count'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

    def get_option_count(self, obj):
        return obj.options.count()

class PollDetailSerializer(PollListSerializer):
    created_by = UserSerializer(read_only=True)
    options = OptionSerializer(many=True, read_only=True)
    total_votes = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    user_votes = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = [
            'id', 'title', 'description', 'created_by', 'created_at', 'expires_at', 'is_active', 'allow_multiple_votes', 'total_votes', 'is_expired', 'option_count', 'options', 'user_votes'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

    def get_user_votes(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            votes = Vote.objects.filter(
                user=request.user,
                option__poll=obj
            ).values_list('option__id', flat=True)
            return list(votes)
        return []

class PollCreateSerializer(serializers.ModelSerializer):
    options = serializers.ListField(
        child=serializers.CharField(max_length=200),
        min_length=2,
        max_length=10,
    )

    class Meta:
        model = Poll
        fields = [
            'title', 'description', 'expires_at', 'is_active', 'allow_multiple_votes', 'options'
        ]

        def validate_options(self, value):
            # Remove duplicates while preserving order
            seen = set()
            unique_options = []
            for option in value:
                option_lower = option.lower().strip()
                if option_lower not in seen:
                    seen.add(option_lower)
                    unique_options.append(option.strip())
            
            if len(unique_options) < 2:
                raise serializers.ValidationError("At least 2 unique options are required.")
            
            return unique_options

        @transaction.atomic
        def create(self, validated_data):
            options_data = validated_data.pop('options')
            poll = Poll.objects.create(**validated_data)
            
            for index, option_text in enumerate(options_data):
                Option.objects.create(
                    poll=poll,
                    text=option_text,
                    order=index
                )
            
            return poll

class VoteSerializer(serializers.ModelSerializer):
    option_id = serializers.IntegerField(write_only=True)
    option = OptionSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Vote
        fields = ['id', 'option_id', 'option', 'user', 'voted_at']
        read_only_fields = ['id', 'user', 'voted_at']

    def validate_option_id(self, value):
        try:
            option = Option.objects.get(id=value)
        except Option.DoesNotExist:
            raise serializers.ValidationError("Invalid option ID.")
        
        # Check if poll is active and not expired
        if not option.poll.is_active:
            raise serializers.ValidationError("This poll is not active.")
        
        if option.poll.is_expired:
            raise serializers.ValidationError("This poll has expired.")
        
        return value
    
    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user
        option_id = attrs['option_id']
        
        try:
            option = Option.objects.get(id=option_id)
        except Option.DoesNotExist:
            raise serializers.ValidationError("Invalid option.")
        
        # Check if user has already voted in this poll
        if not option.poll.allow_multiple_votes:
            existing_vote = Vote.objects.filter(
                user=user,
                option__poll=option.poll
            ).exists()
            
            if existing_vote:
                raise serializers.ValidationError(
                    "You have already voted in this poll."
                )
        
        return attrs
    
    def create(self, validated_data):
        option_id = validated_data.pop('option_id')
        option = Option.objects.get(id=option_id)
        
        # Get client IP
        request = self.context.get('request')
        ip_address = self.get_client_ip(request)
        
        vote = Vote.objects.create(
            user=request.user,
            option=option,
            ip_address=ip_address,
            **validated_data
        )
        
        return vote
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip