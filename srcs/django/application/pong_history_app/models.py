from django.db import models
from django.utils import timezone
from user_management_app.models import CustomUser

class PongMatchHistory(models.Model):
	id = models.AutoField(primary_key=True)
	user = models.ForeignKey(
		CustomUser,
		on_delete=models.CASCADE,
		null=True,
		related_name="matches"
	)
	opponent = models.ForeignKey(
		CustomUser,
		on_delete=models.SET_NULL,
		null=True,
		related_name="opponent_matches"
	)
	user_score = models.IntegerField()
	opponent_score = models.IntegerField()
	played_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-played_at"]

	# def __str__(self):
	# 	return f"{self.user.username} vs {self.opponent.username} on {self.played_at}"

