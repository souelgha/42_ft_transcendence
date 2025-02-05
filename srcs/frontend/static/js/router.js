//use strict?
"use strict";

//import all the files of rendering page to be able to manage everything on this pages
import { HomePage } from './pages/HomePage.js';
import { PongMenuPage } from './pages/PongMenuPage.js';
import { NormalGamePage } from './pages/NormalGamePage.js';
import { SoloGamePage } from './pages/SoloGamePage.js';
import { TournamentPage } from './tournament/TournamentPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingPage } from './pages/SettingPage.js';
import { LogoutPage } from './pages/LogoutPage.js';
import { TicTacToeGamePage } from './tic_tac_toe/TicTacToeGamePage.js';
import { AiPage } from './pages/AiPage.js';
import { Header } from './pages/Header.js';
import { MultiPage } from './pages/MultiPage.js';


//first step : Creation of a class Router which will allows to naviguates between pages and add an history
class Router {
    //constructor of the class call his 3 function
    constructor() {
		this.header = new Header();
        this.routes = new Map();
        this.container = document.getElementById('dynamicPage');

        this.initializeCsrfToken();
        this.initializeRoutes();
        this.setupEventListeners();
        this.handleLocation();
    }

    async initializeCsrfToken() {
        try {
            const response = await fetch('/api/csrf', {
                credentials: 'same-origin'
            });
            const data = await response.json();
            // global variable to use the CSRF token in the RegisterPage.js
            window.csrfToken = data.csrf_token;
            console.log('CSRF Token initialized in Router');
        } catch (error) {
            console.error('Failed to initialize CSRF token:', error);
        }
    }

    //add every path at our Container map "routes"
    initializeRoutes() {
        this.routes.set('/', new HomePage());
        this.routes.set('/pong', new PongMenuPage());
        this.routes.set('/pong/normal', new NormalGamePage("base", "normal", null, null));
        this.routes.set('/pong/solo', new SoloGamePage());
        this.routes.set('/pong/tournament', new TournamentPage());
        this.routes.set('/login', new LoginPage());
        this.routes.set('/register', new RegisterPage());
        this.routes.set('/profile', new ProfilePage());
        this.routes.set('/settings', new SettingPage());
        this.routes.set('/logout', new LogoutPage());
        this.routes.set('/tictactoe', new TicTacToeGamePage());
        this.routes.set('/pong/solo/ai', new AiPage());
        this.routes.set('/pong/multi', new MultiPage());
    }

    //add listeners popstate (backward/forward)
    //The listeners will tell us if someone clicked on the backward or forward button
    //then handleLocation function will manage to change the page.
    setupEventListeners() {
        window.addEventListener('popstate', () => {
            this.handleLocation();
        });

        //  e.target.closest('[data-path]') : Recherche l'élément le plus proche de l'élément cliqué qui contient l'attribut data-path.
        //  Cela permet de détecter si l'utilisateur a cliqué sur un lien ou un bouton avec un chemin spécifié.
        //  Si un tel élément est trouvé :
        //      e.preventDefault() empêche le comportement par défaut du clic (par exemple, éviter qu'un lien ne recharge la page).
        //  target.getAttribute('data-path') récupère la valeur de l'attribut data-path, qui contient probablement l'URL
        //  ou le chemin vers lequel l'utilisateur veut naviguer.
        //  this.navigateTo(path) est appelé pour gérer la navigation dans l'application.

        /**
         * listening to all event 'click' on the document to detect if the user clicked on an element who has the attribute "data-path"
         * The closest() method searches up the DOM tree for elements which matches a specified CSS selector.
         * if the element is found, the event is prevented and the navigateTo function is called with the path of the element.
         */
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-path]');
            if (target) {
                e.preventDefault();
                const path = target.getAttribute('data-path');
                this.navigateTo(path);
            }
        });

    }

    /**
     * how does it work ?
     * 1. get the path of the current page
     * 2. get the page associated to the path
     * 3. if the page is not found, create a new NotFoundPage
     * 4. call the handle function of the page
     */
    async handleLocation() {
		await this.header.render();

        const path = window.location.pathname;
        const page = this.routes.get(path) || new NotFoundPage();
        await page.handle();
    }

    //add the history
    navigateTo(path) {
        window.history.pushState({}, '', path);
        // this.handleLocation();
		window.dispatchEvent(new PopStateEvent('popstate'));
    }
    /*--------------------------------------------------------------------------------------*/
}

//waiting for all document loaded in the DOM before create a Router object.
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});
