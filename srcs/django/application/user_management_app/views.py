from django.http import JsonResponse
from django.middleware.csrf import get_token
from . models import CustomUser, EmailVerification
from django.contrib.auth import authenticate, login, logout
import json
from pong_history_app import views as pong_history_app
from online_status_app.models import OnlineStatus
from django.utils.translation import gettext as _
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
import random
from django.utils import timezone
import logging
import re
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

logger = logging.getLogger(__name__)

def require_login(view_func):
	def wrapper(request, *args, **kwargs):
		if not request.user.is_authenticated:
			return JsonResponse({
				'status': _('error'),
				'message': _('Authentication required'),
				'code': _('not_authenticated')
			}, status=401)
		return view_func(request, *args, **kwargs)
	return wrapper

def login_user(request):
	# Declare variables at the top
	data		= json.load(request)
	email		= data.get('email')
	password	= data.get('password')

	# Validate required fields
	if not email or not password:
		return JsonResponse({
			'status': 'error',
			'message': 'Email and password are required'
		}, status=400)

	user = CustomUser.objects.filter(email=email).first()

	# First check password
	if user is not None and user.check_password(password):
		# Generate verification code for 2FA
		verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

		# Save verification code
		EmailVerification.objects.create(
			user=user,
			verification_code=verification_code
		)

		# Send 2FA email
		subject = '2FA Verification Required'
		message = f'Your 2FA verification code is: {verification_code}'
		from_email = settings.DEFAULT_FROM_EMAIL
		recipient_list = [email]

		send_mail(subject, message, from_email, recipient_list)

		# Store user credentials in session for verification
		request.session['pending_login_id'] = user.id
		request.session['2fa_required'] = True

		return JsonResponse({
			'status': 'success',
			'message': '2FA verification required',
			'code': 'needs_verification',
			'email': email
		}, status=200)

	return JsonResponse({
		'status': 'error',
		'message': 'Invalid email or password'
	}, status=401)

@require_login
def logout_user(request):
	if request.method == 'POST':
		logout(request)
		return JsonResponse({
			'status': 'success',
			'message': 'user logged out'
		}, status=200)
	else:
		return JsonResponse({
			'status': 'error',
			'message': 'invalid request method'
		}, status=405)

@require_login
def delete_account(request):
	if request.method != 'POST':
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid request method'
		}, status=405)

	try:
		user = request.user
		user.delete()
		# user.is_active = False
		# user.save()
		return JsonResponse({
			'status': 'success',
			'message': 'Account deleted successfully'
		}, status=200)
	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)

def get_csrf_token(request):
	csrf_token = get_token(request)
	return JsonResponse({
		'status': 'success',
		'csrf_token': csrf_token
	}, status=200)

def validate_username(username):
	"""Validate username requirements"""
	if not username:
		raise ValidationError('Username is required')
	if len(username) > 20:
		raise ValidationError('Username must be less than 20 characters')
	if len(username) < 1:
		raise ValidationError('Username must be at least 1 character')
	if re.search(r'[!@#$%^&*()_+\-=\[\]{};:"\|,.<>/?]', username):
		raise ValidationError('Username cannot contain special characters')

def validate_user_input(username=None, email=None, password=None):
	"""Validate user input fields"""
	errors = []

	# Username validation
	if username is not None:
		try:
			validate_username(username)
		except ValidationError as e:
			errors.extend(e.messages)

	# Email validation
	if email is not None:
		try:
			validate_email(email)
		except ValidationError:
			errors.append('Invalid email format')

	# Password validation
	if password is not None:
		if len(password) < 8:
			errors.append('Password must be at least 8 characters')

	return errors

def register_user(request):
	data = json.load(request)
	username = data.get('username')
	email = data.get('email')
	password = data.get('password')

	# Validate input
	validation_errors = validate_user_input(username, email, password)
	if validation_errors:
		return JsonResponse({
			'status': 'error',
			'message': validation_errors
		}, status=400)

	# Check if user already exists
	if CustomUser.objects.filter(email=email).exists():
		return JsonResponse({
			'status': 'error',
			'message': 'Email already registered'
		}, status=409)

	is_active = False
	user = CustomUser.objects.create_user(
		username=username,
		email=email,
		password=password,
		is_active=is_active
	)

	# store user id in session
	request.session['temp_user_id'] = user.id

	return JsonResponse({
		'status': 'success',
		'message': 'Verification email sent'
	}, status=200)

# this func is executed when a new user is created
@receiver(post_save, sender=CustomUser)
def send_email_verification(sender, instance, created, **kwargs):
	if created and not instance.is_active:
		# Generate 6-digit verification code
		verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

		# Create verification token
		EmailVerification.objects.create(
			user=instance,
			verification_code=verification_code
		)

		# Send email
		subject = 'Please Activate Your Account'
		message = f'Your verification code is: {verification_code}'
		from_email = settings.DEFAULT_FROM_EMAIL
		recipient_list = [instance.email]

		send_mail(subject, message, from_email, recipient_list)

def resend_verification(request):
	if request.method != 'POST':
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid request method'
		}, status=405)

	data = json.load(request)
	email = data.get('email')

	try:
		user = CustomUser.objects.get(email=email, is_active=False)

		# Delete existing verification
		EmailVerification.objects.filter(user=user).delete()

		# Generate new verification code
		verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

		# Create new verification
		EmailVerification.objects.create(
			user=user,
			verification_code=verification_code
		)

		# Send email
		subject = 'New Verification Code'
		message = f'Your new verification code is: {verification_code}'
		from_email = settings.DEFAULT_FROM_EMAIL
		recipient_list = [email]

		send_mail(subject, message, from_email, recipient_list)

		return JsonResponse({
			'status': 'success',
			'message': 'New verification code sent'
		})

	except CustomUser.DoesNotExist:
		return JsonResponse({
			'status': 'error',
			'message': 'User not found or already activated'
		}, status=404)

def verify_email(request):
	if request.method != 'POST':
		return JsonResponse({
			'status': 'error',
			'message': _('Invalid request method')
		}, status=405)

	try:
		data = json.load(request)
		email = data.get('email')
		verification_code = data.get('code')

		user = CustomUser.objects.get(email=email)
		verification = EmailVerification.objects.get(
			user=user,
			verification_code=verification_code
		)

		# Check if code is expired
		if verification.expires_at < timezone.now():
			return JsonResponse({
				'status': 'error',
				'message': _('Verification code expired')
			}, status=400)

		# For 2FA login verification
		pending_login_id = request.session.get('pending_login_id')
		if pending_login_id and pending_login_id == user.id:
			verification.delete()
			del request.session['pending_login_id']
			del request.session['2fa_required']
			login(request, user)

			new_csrf_token = get_token(request)
			return JsonResponse({
				'status': 'success',
				'message': _('2FA verification successful'),
				'isAuthenticated': True,
				'username': user.username,
				'csrf_token': new_csrf_token
			})

		# For new user registration verification
		temp_user_id = request.session.get('temp_user_id')
		if temp_user_id and temp_user_id == user.id:
			user.is_active = True
			user.save()
			verification.delete()
			del request.session['temp_user_id']
			login(request, user)

			new_csrf_token = get_token(request)
			return JsonResponse({
				'status': 'success',
				'message': _('Email verified and logged in successfully'),
				'isAuthenticated': True,
				'username': user.username,
				'csrf_token': new_csrf_token
			})

	except (CustomUser.DoesNotExist, EmailVerification.DoesNotExist):
		return JsonResponse({
			'status': 'error',
			'message': _('Invalid verification code')
		}, status=400)
	except Exception as e:
		logger.error(f"Error during verification: {str(e)}")
		return JsonResponse({
			'status': 'error',
			'message': _('An error occurred during verification')
		}, status=500)

@require_login
def update_profile(request):
	if request.method != 'POST':
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid request method'
		}, status=405)

	try:
		username = request.POST.get('username')
		uploaded_image = request.FILES.get('image')

		# Validate input
		validation_errors = validate_user_input(username)
		if validation_errors:
			return JsonResponse({
				'status': 'error',
				'message': validation_errors
			}, status=400)

		# Validate image if provided
		if uploaded_image:
			if uploaded_image.size > 5 * 1024 * 1024:  # 5MB limit
				return JsonResponse({
					'status': 'error',
					'message': 'Image size must be less than 5MB'
				}, status=400)

			allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
			if uploaded_image.content_type not in allowed_types:
				return JsonResponse({
					'status': 'error',
					'message': 'Invalid image format'
				}, status=400)

		# fetch the user info based on surrent request.user.email
		u = CustomUser.objects.get(email=request.user.email)

		if uploaded_image:
			#delete current profile image
			if u.profile_image:
				u.profile_image.delete()
			# store new profile image
			u.profile_image = uploaded_image

		# save new username and email
		u.username = username
		u.save()

		return JsonResponse({
			'status': 'success',
			'message': 'profile updated'
		}, status=200)
	except Exception as e:
		return JsonResponse({
			'status': 'success',
			'message': str("failed update")
		}, status=200)

@require_login
def get_profile(request):
	user = request.user

	match_response = pong_history_app.get_user_matches(request)
	if (match_response.status_code != 200):
		logger.error("match_response failed")
		return JsonResponse({
			'status': 'error',
			'message': 'Failed to fetch match history'
		}, status=500)
	else:
		match_data = json.loads(match_response.content)['data']

	friends_data = [
		{
			'id': friend.id,
			'username': friend.username,
			'profile_image': friend.profile_image.url if friend.profile_image else None,
			'is_online': OnlineStatus.objects.get(user_id=friend.id).is_online if OnlineStatus.objects.filter(user_id=friend.id).exists() else False,
			'lastSeen': friend.last_login,
			'wins': friend.wins,
			'losses': friend.losses,
			'totalGames': friend.totalGames
		}
		for friend in user.friends.all()
	]

	return JsonResponse({
		'status': 'success',
		'data': {
			'username': user.username,
			'email': user.email,
			'join_date': user.date_joined,
			'total_games': match_data['total_games'],
			'wins': match_data['wins'],
			'losses': match_data['losses'],
			'win_percent': match_data['win_percent'],
			'image_path': user.profile_image.url if user.profile_image else None,
			'friends': friends_data,
			'match_history': match_data['matches'],
			'is_online': True
		}
	})

def get_user(request):
	if request.user.is_authenticated:
		return JsonResponse({
			'status': 'success',
			'data': {
				'username': request.user.username,
				'isAuthenticated': True
			}
		})
	else:
		return JsonResponse({
			'status': 'success',
			'data': {
				'isAuthenticated': False
			}
		})

@require_login
def search_user(request):
	try:
		data = json.loads(request.body)
		search_term = data.get('search_term', '')

		# Validate search term
		try:
			validate_username(search_term)
		except ValidationError as e:
			return JsonResponse({
				'status': 'error',
				'message': e.messages
			}, status=400)

		if not search_term:
			return JsonResponse({
				'status': 'success',
				'data': []
			})

		users = CustomUser.objects.filter(
			username__icontains=search_term
		).exclude(
			username=request.user.username
		)

		users_data = [
			{
				'id' : user.id,
				'username': user.username,
				'profile_image': user.profile_image.url if user.profile_image else None,
				'is_online': OnlineStatus.objects.get(user_id=user.id).is_online if OnlineStatus.objects.filter(user_id=user.id).exists() else False,
				'is_friend': request.user.friends.filter(id=user.id).exists()
			}
			for user in users
		]

		return JsonResponse({
			'status': 'success',
			'data': users_data
		})

	except json.JSONDecodeError:
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid JSON data'
		}, status=400)
	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)

@require_login
def add_friend(request):
	try:
		data = json.loads(request.body)
		friend_id = data.get('friend_id')

		friend = CustomUser.objects.get(id=friend_id)
		request.user.friends.add(friend)
		request.user.save()

		return JsonResponse({
			'status': 'success',
			'message': 'friend added'
		}, status=200)
	except CustomUser.DoesNotExist:
		return JsonResponse({
			'status': 'error',
			'message': 'User not found'
		}, status=404)
	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)

@require_login
def remove_friend(request):
	try:
		data = json.loads(request.body)
		friend_id = data.get('userid')

		friend = CustomUser.objects.get(id=friend_id)
		request.user.friends.remove(friend)
		request.user.save()

		return JsonResponse({
			'status': 'success',
			'message': 'friend removed'
		}, status=200)
	except CustomUser.DoesNotExist:
		return JsonResponse({
			'status': 'error',
			'message': 'User not found'
		}, status=404)
	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)
