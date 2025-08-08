from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Prefetch
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Poll, Option, Vote
from .serializers import (
    PollListSerializer, PollDetailSerializer, PollCreateSerializer,
    VoteSerializer, OptionSerializer
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'expires_at', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PollCreateSerializer
        elif self.action == 'list':
            return PollListSerializer
        return PollDetailSerializer
    
    def get_queryset(self):
        queryset = Poll.objects.select_related('created_by').prefetch_related(
            Prefetch('options', queryset=Option.objects.order_by('order'))
        )
        
        # Filter by active and non-expired polls by default
        if self.action == 'list':
            show_all = self.request.query_params.get('show_all', 'false').lower()
            if show_all != 'true':
                queryset = queryset.filter(
                    is_active=True
                ).filter(
                    Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
                )
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        # Only allow the creator to update their polls
        if serializer.instance.created_by != self.request.user:
            raise permissions.PermissionDenied("You don't have permission to edit this poll.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow the creator to delete their polls
        if instance.created_by != self.request.user:
            raise permissions.PermissionDenied("You don't have permission to delete this poll.")
        instance.delete()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        """Cast a vote for a specific option in this poll"""
        poll = self.get_object()
        serializer = VoteSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Verify the option belongs to this poll
            option_id = serializer.validated_data['option_id']
            if not poll.options.filter(id=option_id).exists():
                return Response(
                    {'error': 'Option does not belong to this poll.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            vote = serializer.save()
            return Response(VoteSerializer(vote).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get detailed results for this poll"""
        poll = self.get_object()
        
        # Get options with vote counts
        options = poll.options.annotate(
            vote_count=Count('votes')
        ).order_by('order')
        
        total_votes = sum(option.vote_count for option in options)
        
        results = []
        for option in options:
            percentage = 0
            if total_votes > 0:
                percentage = round((option.vote_count / total_votes) * 100, 2)
            
            results.append({
                'id': option.id,
                'text': option.text,
                'vote_count': option.vote_count,
                'percentage': percentage
            })
        
        return Response({
            'poll_id': poll.id,
            'poll_title': poll.title,
            'total_votes': total_votes,
            'results': results,
            'is_expired': poll.is_expired,
            'is_active': poll.is_active
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_polls(self, request):
        """Get polls created by the current user"""
        polls = self.get_queryset().filter(created_by=request.user)
        serializer = PollListSerializer(polls, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_votes(self, request):
        """Get polls the user has voted in"""
        voted_poll_ids = Vote.objects.filter(user=request.user).values_list('option__poll', flat=True).distinct()
        polls = self.get_queryset().filter(id__in=voted_poll_ids)
        serializer = PollListSerializer(polls, many=True, context={'request': request})
        return Response(serializer.data)

class VoteViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    serializer_class = VoteSerializer
    
    def get_queryset(self):
        return Vote.objects.filter(user=self.request.user).select_related(
            'option__poll', 'user'
        ).order_by('-voted_at')
