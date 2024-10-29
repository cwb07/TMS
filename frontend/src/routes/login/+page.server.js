import { redirect } from '@sveltejs/kit';
import { USER_URL } from '../../../constants';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const username = form.get('username');
		const password = form.get('password');

		if (username && password) {
			const response = await fetch(`${USER_URL}/login`, {
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
			}
		}

		return { error: 'Invalid credentials' };
	}
};
