import { USER_URL } from '$lib/constants';
import axios from 'axios';
import { handleApiError } from '$lib/errorHandler.js';

// check if admin
export const load = async ({ request }) => {
	try {
		await axios.get(`${USER_URL}/admin`, {
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': request.headers.get('User-Agent'),
				cookie: request.headers.get('cookie')
			}
		});
	} catch (err) {
		return handleApiError(err, false);
	}
};
