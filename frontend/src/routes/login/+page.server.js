import { API_URL } from '$lib/constants';
import axios from 'axios';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const username = form.get('username');
		const password = form.get('password');

		try {
			const response = await axios.post(
				`${API_URL}/login`,
				{
					username,
					password
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': request.headers.get('User-Agent'),
						cookie: request.headers.get('cookie')
					}
				}
			);

			let token = response.headers['set-cookie'][0].split(';')[0].split('=')[1];

			cookies.set('jwt', token, {
				path: '/'
			});

			if (response.data.success) {
				return {
					loginSuccess: true
				};
			}
		} catch (err) {
			return {
				errorMessage: err.response.data.message
			};
		}
	}
};
