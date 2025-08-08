from django.contrib import admin
from .models import Poll, Option, Vote

@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'created_at', 'expires_at', 'is_active', 'total_votes']
    list_filter = ['is_active', 'created_at', 'expires_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'total_votes']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'poll', 'order', 'vote_count']
    list_filter = ['poll']
    search_fields = ['text', 'poll__title']
    ordering = ['poll', 'order']

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'option', 'voted_at', 'ip_address']
    list_filter = ['voted_at', 'option__poll']
    search_fields = ['user__username', 'option__text', 'option__poll__title']
    readonly_fields = ['voted_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'option__poll')
