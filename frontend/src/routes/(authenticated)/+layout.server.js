import { USER_URL } from '$lib/constants';
import axios from 'axios';

// load and display logged in user's information
export const load = async ({ request, depends }) => {
	depends("loadLayout");

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
		return { username: response.data.data.username, email: response.data.data.email };
	}
};
