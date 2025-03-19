from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import OnlineStatus

class UserStatusConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		user = self.scope["user"]
		if not user.is_authenticated:
			await self.close()
			return

		await self.accept()
		await self.update_user_status(True)

	async def disconnect(self, close_code):
		if self.scope["user"].is_authenticated:
			await self.update_user_status(False)

	@database_sync_to_async
	def update_user_status(self, is_online):
		try:
			if not self.scope["user"].is_authenticated:
				return
			user = self.scope["user"]
			online_status, created = OnlineStatus.objects.get_or_create(
				user=user,
				defaults={'is_online': False, 'last_seen': timezone.now()}
			)
			online_status.update_status(is_online)
		except Exception as e:
			print(f"Error updating user status: {e}")
