export class Header {
    constructor() {
        this.container = document.getElementById('header-container');
    }

    async render() {
        try {
            const response = await fetch('/api/user', {
                credentials: 'include'
            });
            const data = await response.json();
            const isLoggedIn = data.data.isAuthenticated;
            const username = isLoggedIn ? data.data.username : '';

            this.container.innerHTML = `
                <nav class="navbar navbar-expand-lg navbar-light bg-secondary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/" data-path="/">
                            <img src="/static/img/logo.png" alt="Logo" width="80" height="40">
                        </a>
                        <div class="d-flex align-items-center">
                            ${isLoggedIn ?
                                `<span class="text-light me-3">Welcome, ${username}!</span>
                                 <div class="dropdown">
                                    <img src="/static/img/anonymous.webp" class="rounded-circle" alt="Profile" width="40" height="40" style="cursor: pointer" data-bs-toggle="dropdown">
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li><a class="dropdown-item" href="/profile" data-path="/profile">Mypage</a></li>
                                        <li><a class="dropdown-item" href="/settings" data-path="/settings">Settings</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item" href="/logout" data-path="/logout">Logout</a></li>
                                    </ul>
                                 </div>` :
                                `<div class="dropdown">
                                    <img src="/static/img/anonymous.webp" class="rounded-circle" alt="Profile" width="40" height="40" style="cursor: pointer" data-bs-toggle="dropdown">
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li><a class="dropdown-item" href="/login" data-path="/login">Login</a></li>
                                        <li><a class="dropdown-item" href="/register" data-path="/register">Register</a></li>
                                    </ul>
                                 </div>`
                            }
                        </div>
                    </div>
                </nav>
            `;
        } catch (error) {
            console.error('Failed to render header:', error);
        }
    }
}
