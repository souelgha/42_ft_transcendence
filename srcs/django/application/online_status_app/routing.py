from django.urls import re_path
from online_status_app.consumers import UserStatusConsumer

websocket_urlpatterns = [
	re_path(r'ws/user_status/$', UserStatusConsumer.as_asgi()),
]
