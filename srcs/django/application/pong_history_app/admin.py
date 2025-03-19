from django.contrib import admin
from .models import PongMatchHistory

class PongMatchHistoryAdmin(admin.ModelAdmin):
	list_display = ("user", "opponent", "user_score", "opponent_score", "played_at")
	list_filter = ("played_at",)
	search_fields = ("user__username", "opponent__username")
admin.site.register(PongMatchHistory, PongMatchHistoryAdmin)
