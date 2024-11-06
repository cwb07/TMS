import { USER_URL } from '$lib/constants';
import axios from 'axios';
import { handleApiError } from '$lib/errorHandler.js';

// ensure user is logged in and not disabled, return user info to data
export const load = async ({ request }) => {
	try {
		const response = await axios.get(`${USER_URL}`, {
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
