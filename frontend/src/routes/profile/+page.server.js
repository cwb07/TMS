import { API_URL } from '$lib/constants';
import axios from 'axios';
import { handleApiError } from '$lib/errorHandler.js';

// ensure user is logged in and not disabled, return user info to data
export const load = async ({ request }) => {
	console.log("getprofile")

	try {
		const response = await axios.get(`${API_URL}/getUser`, {
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': request.headers.get('User-Agent'),
				cookie: request.headers.get('cookie')
			}
		});

		if (response.status === 200) {
			return {
				username: response.data.data.username,
				email: response.data.data.email,
				isAdmin: response.data.data.isAdmin
			};
		}
	} catch (err) {
		return handleApiError(err, false);
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

			if (response.status === 200) {
				return {
					successMessage: response.data.message,
					errorMessage: '',
					resetUpdateProfileForm: true
				};
			}
		} catch (err) {
			return handleApiError(err);
		}
	}
};
