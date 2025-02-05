from django.http import JsonResponse
from django.middleware.csrf import get_token
from . models import CustomUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
import json
import datetime

def login_user(request):
	data = json.load(request)
	email = data.get('email')
	password = data.get('password')
	user = authenticate(email=email, password=password)
	if user is not None:
		login(request, user)
		return JsonResponse({
			'status': 'success',
			'message': 'user logged in'
		}, status=200)
	else:
		return JsonResponse({
			'status': 'failure',
			'message': 'bad user info'
		}, status=401)

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

def register_user(request):
	data = json.load(request)
	username = data.get('username')
	email = data.get('email')
	password = data.get('password')
	user = CustomUser.objects.create_user(username=username, email=email, password=password) #this is not used ?
	return JsonResponse({
		'status': 'success',
		'message': 'user registered'
	}, status=200)

def get_csrf_token(request):
	csrf_token = get_token(request)
	return JsonResponse({
		'status': 'success',
		'csrf_token': csrf_token
	}, status=200)

@login_required
def update_profile(request):
	print("Request method:", request.method)
	print("Request FILES:", request.FILES)
	print("Request POST:", request.POST)
	if (request.method != 'POST'):
		print(request.method)
		return JsonResponse({
			'status': 'error',
			'message' : 'Invalid request method'
		}, status=405)

	try:
		data = json.load(request)
		username = data.get('username')
		email = data.get('email')
		image = data.get('image')

		#load user data based on request.user email
		u = CustomUser.objects.get(email=request.user.email)

		# this will save the new user data to the database
		u.username = username
		u.email = email
		u.profile_image = image
		u.save()

		return JsonResponse({
			'status': 'success',
			'message': 'update made',
			#'data' : {
			#	'username': u.username,
			#	'email': u.email,
			#	'profile_image': u.profile_image
			#}
		}, status=200)
	except Exception as e:
		return JsonResponse({
			'status': 'success',
			'message': str("failed update")
		}, status=200)

@login_required
def get_profile(request):
	user = request.user

	# Convert ManyToMany field to list of usernames or IDs
	friends_data = [
		{
			'id': friend.id,
			'username': friend.username,
			'profile_image': friend.profile_image.url if friend.profile_image else None,
			'is_online': "true",
			'lastSeen': "Now"
		}
		for friend in user.friends.all()
	]

	return JsonResponse({
		'status': 'success',
		'data': {
			'username': user.username,
			'email': user.email,
			'join_date': user.date_joined,
			'totalGames': user.totalGames,
			'wins': user.wins,
			'losses': user.losses,
			'profile_image': user.profile_image.url if user.profile_image else None,
			'friends': friends_data
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

def search_user(request):
	try:
		data = json.loads(request.body)
		search_term = data.get('search_term', '')

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
				'is_online': False,
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
