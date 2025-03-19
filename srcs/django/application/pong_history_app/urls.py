from django.urls import path
from . import views

urlpatterns = [
	path('user_history/', views.get_user_matches, name='get_user_matches'),
	path('record_match/', views.record_match, name='record_match'),
]
