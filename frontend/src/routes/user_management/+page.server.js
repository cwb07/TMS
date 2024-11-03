import { GROUP_URL, USER_URL } from '../../../constants';
import axios from 'axios';

export const load = async ({ request, depends }) => {
	depends("loadUserManagement");

	// Fetch groups first
	const groupResponse = await axios.get(
		`${GROUP_URL}`,
		{
			headers: {
				'Content-Type': 'application/json',
				cookie: request.headers.get('cookie')
			}
		}
	);

	// Proceed to fetch users only after fetching groups
	const userResponse = await axios.get(
		`${USER_URL}/all`,
		{
			headers: {
				'Content-Type': 'application/json',
				cookie: request.headers.get('cookie')
			}
		}
	);

	if (groupResponse.status === 200 && userResponse.status === 200) {
		return {
			groupsList: groupResponse.data.data,
			usersList: userResponse.data.data
		};
	}
};

export const actions = {
	editUser: async ({ request, cookies }) => {
		const form = await request.formData();

		const username = form.get('username');
		const email = form.get('email');
		const password = form.get('password');

		// get as an array
		let groups = form.get('selectedGroups').split(',');
		groups = groups.filter((group) => group !== '');

		const accountstatus = form.get('accountstatus');

		const editFormData = { username, email, password, groups, accountstatus };

		// edit user
		const response = await fetch(`${USER_URL}/edit`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				cookie: cookies.get('token')
			},
			body: JSON.stringify({ username, email, password, groups, accountstatus })
		});

		const data = await response.json();

		if (response.ok) {
			return { success: data.message, editSuccess: true };
		} else {
			return { error: data.message, editFormData };
		}
	}
};
