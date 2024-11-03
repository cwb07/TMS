import { USER_URL } from '$lib/constants';
import axios from 'axios';
import { error } from '@sveltejs/kit';

// ensure user is logged in, return user info to data
export const load = async ({ request, depends }) => {
	depends("loadUserCheck");

	try {
		const response = await axios.get(
			`${USER_URL}`,
			{
				headers: {
					'Content-Type': 'application/json',
					cookie: request.headers.get('cookie')
				}
			}
		);

		if (response.status === 200) {
			return { username: response.data.data.username, email: response.data.data.email, isAdmin: response.data.data.isAdmin };
		}
	} catch (err) {
		// user not logged in
		// redirect to login page
		if (err.response.status === 401) {
			error(401, {
				message: err.response.data.message,
				redirect: true
			});
		} else {
			error(500, {
				message: 'Internal Server Error'
			});
		}
	}
};