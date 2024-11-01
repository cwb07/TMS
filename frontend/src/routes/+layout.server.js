import { USER_URL } from '../../constants';

export const load = async ({ cookies }) => {
	console.log('LAYOUT RELOADED');

	const response = await fetch(`${USER_URL}`, {
		headers: {
			cookie: cookies.get('token')
		}
	});

	if (response.ok) {
		const data = await response.json();
		return { username: data.data.username, email: data.data.email };
	} else {
		return { user: null };
	}
};
