from django.contrib import admin
from .models import OnlineStatus

class OnlineStatusAdmin(admin.ModelAdmin):
	list_display = ('user', 'is_online', 'last_seen')

admin.site.register(OnlineStatus, OnlineStatusAdmin)
