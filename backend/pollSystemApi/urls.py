from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'polls', views.PollViewSet)
router.register(r'votes', views.VoteViewSet, basename='vote')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/', include('pollSystemAccounts.urls')),
]
