import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const username = form.get('username');
		const password = form.get('password');

		if (!username || !password) {
			return { errors: 'Invalid credentials' }
		} else {
			const response = await fetch('http://localhost:3000/api/accounts/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});

			if (response.ok) {
				const token = response.headers.get('set-cookie');
				if (token) {
					cookies.set('token', token, {
						path: '/'
					});
				}

				redirect(303, '/user_management');
			} else {
				const data = await response.json();
				return { error: data.message }
			}
		}
	}
};
