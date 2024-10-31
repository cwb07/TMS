import { USER_URL } from "../../constants";

export const load = async ({ cookies }) => {
	const token = cookies.get('token');

	const response = await fetch(`${USER_URL}`, {
		headers: {
			cookie: token
		}
	});

	if (response.ok) {
		const data = await response.json();
		return { user: data.data.username };
	} else {
		return { user: null };
	}
};
