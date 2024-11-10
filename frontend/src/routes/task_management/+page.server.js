import axios from 'axios';
import { error } from '@sveltejs/kit';

// ensure user is logged in and not disabled, return user info to data
export const load = async ({ request }) => {
	try {
		const response = await axios.get(`http://localhost:3000/getUser`, {
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
		if (err.response.status === 401) {
			error(401, { message: err.response.data.message, redirectToLogin: true })
		} else if (err.response.status === 403) {
			error(403, { message: err.response.data.message, redirectToTMS: true })
		} else {
			error(500, { message: "Internal server error" })
		}
	}
};
