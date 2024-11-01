import { GROUP_URL, USER_URL } from '../../../constants';

export const load = async ({ cookies }) => {
	// Fetch groups first
	const groupResponse = await fetch(GROUP_URL, {
		headers: {
			cookie: cookies.get('token')
		}
	});
	const groupsData = await groupResponse.json();

	// Proceed to fetch users only after fetching groups
	const userResponse = await fetch(`${USER_URL}/all`, {
		headers: {
			cookie: cookies.get('token')
		}
	});
	const usersData = await userResponse.json();

	if (groupResponse.ok && userResponse.ok) {
		return {
			groupsList: groupsData.data,
			usersList: usersData.data
		};
	} else {
		return { error: 'Failed to load data' };
	}
};

export const actions = {
	createGroup: async ({ request, cookies }) => {
		const form = await request.formData();
		const groupname = form.get('groupname');

		if (groupname && groupname.trim().length > 0) {
			// max 50 characters, alphanumeric with possible underscore
			const groupnameRegex = /^[a-zA-Z0-9_]{1,50}$/;

			if (!groupnameRegex.test(groupname)) {
				return {
					error:
						'Group name must be alphanumeric (allow underscore) and have a maximum of 50 characters',
					groupname
				};
			}

			const response = await fetch(`${GROUP_URL}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					cookie: cookies.get('token')
				},
				body: JSON.stringify({ groupname })
			});

			const data = await response.json();

			if (response.ok) {
				return { success: data.message, newGroup: groupname };
			} else {
				return { error: data.message, groupname };
			}
		}

		return { error: 'Group name is mandatory', groupname };
	},
	createUser: async ({ request, cookies }) => {
		const form = await request.formData();

		const username = form.get('username');
		const email = form.get('email');
		const password = form.get('password');

		// get as an array
		let groups = form.get('selectedGroups').split(',');
		groups = groups.filter((group) => group !== '');

		const accountstatus = form.get('accountstatus');

		// return back the form data
		// to repopulate the form fields
		// in case of error
		const formData = { username, email, password, groups, accountstatus };

		// add new user
		const response = await fetch(`${USER_URL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				cookie: cookies.get('token')
			},
			body: JSON.stringify({ username, email, password, groups, accountstatus })
		});

		const data = await response.json();

		if (response.ok) {
			return { success: data.message };
		} else {
			return { error: data.message, formData };
		}
	},
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
