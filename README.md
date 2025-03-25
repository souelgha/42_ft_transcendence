# ft_transcendence
```
score : 120/100
```
<div align="center">
	<code><img width="30" src="https://github.com/souelgha/images/blob/main/icons8-html-48.png" alt="HTML" title="HTML"/></code>
	<code><img width="30" src="https://github.com/souelgha/images/blob/main/icons8-css3-48.png" alt="CSS" title="CSS"/></code>
	<code><img width="30" src="https://github.com/souelgha/images/blob/main/icons8-bootstrap-48.png" alt="Bootstrap" title="Bootstrap"/></code>
	<code><img width="30" src="https://github.com/souelgha/images/blob/main/icons8-js-48.png" alt="JavaScript" title="JavaScript"/></code>
	<code><img width="30" src="https://github.com/souelgha/images/blob/main/icons8-python-48.png" alt="Python" title="Python"/></code>
	<code><img width="30" src="https://github.com/souelgha/images/blob/main/icons8-django-48.png" alt="Django" title="Django"/></code>
	<code><img width="30" src="https://github.com/souelgha/images/blob/main/icons8-python-48.png" alt="PostgreSQL" title="PostgreSQL"/></code>
  <code><img width="30" src="https://github.com/souelgha/images/blob/main/icons8-docker-48.png" alt="Docker" title="Docker"/></code>
 
</div>
<div align="center">
<img src="https://github.com/souelgha/42_ft_transcendance/blob/main/accueil.png" alt="ft_transcendence" width="500"/>
</div>

## The project
This is the final project of commun core 42 cursus. It was developped by a team of 4 developpers. It is a multiplayer game based on [Pong classic game](https://www.ponggame.org/)

## Games
User can play games against each other on the same device or in remote mode
- **Solo Mode**: Train alone or battle an AI opponent.
- **Battle mode**: Compete against on line opponent.
- **Duel Mode**: 2-players game on a single keyboard.
- **Tri Mode** : circular 3-players game on a single keyboard.
- **Tournaments**: Create tournaments to play with friends.
![apercu](/pong-selec.png)
	
## Features and Technology
- **Frontend**:
  	- Create an intuitive user interface.
  	- **Bootstrap**.
- **Backend**: 
	- Support platform functionality and performance.
   	- **Django**.  
- **Database**: 	
 	- Store user data, manage user profiles in secure way, game stats, and history.
	- **PostgreSQL**.
- **2FA Authentication System**:
  	- security management against SQL injection/XSS.
  	- JSON Web Tokens (JWT).
- **User Management**: 
	- User registration, login, profile management, and game history tracking.
   	- **Python**.
- **Design Backend as microservice**:
  	- Each microservice is responsible for a single, well-defined task for maintainability and scalability.
  	-  **Django**
- **Multi-language Support**: 
  	- Available in multiple languages to cater to global users : English, French, Spanish, Japanese.
  	- **Javascript**
- **Docker & Makefile**:
  	- Utilize Docker for containerized deployment and a Makefile for simplifying project launch and management.
  	- **Docker** & **Makefile**.
![apercu](/profile.png)

## Build and start
- Prerequisites : Docker installed.
- modify the working-path inside docker-compose.yml file and the Makefile
- Run Make to build the project
  ``` bash
  make
  ```
  ![apercu](/docker%20running.png)
  
- When containers are running you can start the game using https://localhost

ENJOY ! 🚀🥳




