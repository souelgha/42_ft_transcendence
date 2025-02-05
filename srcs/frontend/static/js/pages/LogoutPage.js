export class LogoutPage {
    constructor() {
        this.container = document.getElementById('dynamicPage');
    }

    async handle() {
        try {
			const csrfToken = document.cookie
				.split('; ')
				.find(row => row.startsWith('csrftoken='))
				?.split('=')[1];

			const response = await fetch('/api/logout', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': csrfToken,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			window.history.pushState({}, '', '/');
			window.dispatchEvent(new PopStateEvent('popstate'));

		} catch (error) {
			console.error('Logout failed:', error);
		}
    }
}
