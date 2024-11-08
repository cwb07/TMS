import { API_URL } from '$lib/constants';
import axios from 'axios';
import { handleApiError } from '$lib/errorHandler.js';

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
				isAdmin: response.data.data.isAdmin
			};
		}
	} catch (err) {
		return handleApiError(err, false);
	}
};
