import { API_URL } from '$lib/constants';
import axios from 'axios';
import { error } from '@sveltejs/kit';

// ensure user is logged in and not disabled, return user info to data
export const load = async ({ request }) => {
	try {
		const response = await axios.get(`${API_URL}/getUser`, {
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': request.headers.get('User-Agent'),
				cookie: request.headers.get('cookie')
			}
		});

		if (response.data.success) {
			return {
				username: response.data.data.username,
				isAdmin: response.data.data.isAdmin,
				email: response.data.data.email
			};
		}
	} catch (err) {
		if (err.response.status === 401) {
			error(401, { message: err.response.data.message, redirectToLogin: true })
		} else if (err.response.status === 403) {
			error(403, { message: err.response.data.message, redirectToTMS: true })
		} else {
			error(500, { message: "Internal server error" })
		}
	}
};

export const actions = {
	default: async ({ request }) => {
		const form = await request.formData();

		const username = form.get('username');
		const email = form.get('email');
		const password = form.get('password');

		try {
			const response = await axios.put(
				`${API_URL}/updateProfile`,
				{ username, email, password },
				{
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': request.headers.get('User-Agent'),
						cookie: request.headers.get('cookie')
					}
				}
			);

			if (response.data.success) {
				return {
					successMessage: response.data.message,
					errorMessage: '',
					resetUpdateProfileForm: true
				};
			}
		} catch (err) {
			if (err.response.status === 401) {
				error(401, { message: err.response.data.message, redirectToLogin: true })
			} else if (err.response.status === 403) {
				error(403, { message: err.response.data.message, redirectToTMS: true })
			} else {
				return {
					successMessage: '',
					errorMessage: err.response.data.message
				};
			}
		}
	}
};
