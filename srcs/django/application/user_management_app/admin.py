from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser, EmailVerification

class CustomUserAdmin(UserAdmin):
	add_form = CustomUserCreationForm
	form = CustomUserChangeForm

	model = CustomUser

	list_display = ('username', 'email', 'is_active',
					'is_staff', 'is_superuser', 'last_login')
	list_filter = ('is_active', 'is_staff', 'is_superuser')
	fieldsets = (
		(None, {'fields': ('username', 'email', 'password',
		'wins', 'losses', 'totalGames', 'profile_image', 'friends')}),
		('Permissions', {'fields': ('is_staff', 'is_active',
			'is_superuser', 'groups', 'user_permissions')}),
		('Dates', {'fields': ('last_login', 'date_joined')})
	)
	add_fieldsets = (
		(None, {
			'classes': ('wide',),
			'fields': ('username', 'email', 'password1', 'password2',
			'is_staff', 'is_active',
			'wins', 'losses', 'totalGames', 'profile_image', 'friends')}
			),
	)
	search_fields = ('username', 'email',)
	ordering = ('username',)

class EmailVerificationAdmin(admin.ModelAdmin):
	list_display = ('user', 'verification_code', 'created_at', 'expires_at')
	search_fields = ('user__email',)
	ordering = ('-created_at',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(EmailVerification, EmailVerificationAdmin)
