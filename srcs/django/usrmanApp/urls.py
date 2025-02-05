from django.urls import path
from django.conf import settings
from . import views

urlpatterns = [
    path('register', views.register_user),
    path('login', views.login_user),
	path('logout', views.logout_user),
    path('csrf', views.get_csrf_token),
	path('profile/update', views.update_profile, name='update_profile'),
	path('profile/get', views.get_profile, name='get_profile'),
	path('user', views.get_user, name='get_user'),
	path('search_user', views.search_user, name='search_user'),
	path('add_friend', views.add_friend, name='add_friend'),
	path('remove_friend', views.remove_friend, name='remove_friend'),
]
