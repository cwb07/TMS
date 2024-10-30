import { GROUP_URL, USER_URL } from '../../../constants';

export const load = async () => {
	// Fetch groups first
	const groupResponse = await fetch(GROUP_URL);
	const groupsData = await groupResponse.json();

	// Proceed to fetch users only after fetching groups
	const userResponse = await fetch(USER_URL);
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
	createGroup: async ({ request }) => {
		const form = await request.formData();
		const groupname = form.get('groupname');

		if (groupname && groupname.trim().length > 0) {
			// max 50 characters, alphanumeric with possible underscore
			const groupnameRegex = /^[a-zA-Z0-9_]{1,50}$/;

			if (!groupnameRegex.test(groupname)) {
				return { error: 'Invalid group format', groupname };
			}

			const response = await fetch(`${GROUP_URL}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
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

		return { error: 'Group is mandatory', groupname };
	},
	createUser: async ({ request }) => {
		const form = await request.formData();

		const username = form.get('username');
		const email = form.get('email');
		const password = form.get('password');

		// get as an array
		let groups = form.get('selectedGroups').split(',');
		groups = groups.filter((group) => group !== '');

		const accountstatus = form.get('accountstatus');

		// // return back the form data
		// // to repopulate the form fields
		// // in case of error
		const formData = { username, email, password, groups, accountstatus };

		// username, password and status must be filled
		// check null, undefined or empty ""
		// check is not string of whitespaces
		if (!username || username.trim().length === 0) {
			return { error: 'Username is mandatory', formData };
		}

		if (!password || password.trim().length === 0) {
			return { error: 'Password is mandatory', formData };
		}

		if (!accountstatus) {
			return { error: 'Active is mandatory', formData };
		}

		// username regex
		// max 50 characters, alphanumeric with no spaces
		const usernameRegex = /^[a-zA-Z0-9]{1,50}$/;

		if (!usernameRegex.test(username)) {
			return { error: 'Username must be alphanumeric', formData };
		}

		// password regex
		// min 8 char & max 10 char consisting of alphabets, numbers and special characters
		const passwordRegex = /^[^\s]{8,10}$/;

		if (!passwordRegex.test(password)) {
			return { error: 'Invalid password format', formData };
		}

		// email regex if user did enter email (optional)
		const emailRegex = /^[^\s]+@[^\s]+\.com$/;

		if (email && !emailRegex.test(email)) {
			return { error: 'Invalid email format', formData };
		}

		// add new user
		const response = await fetch(`${USER_URL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
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
	editUser: async ({ request }) => {
		const form = await request.formData();

		const username = form.get('username');
		const email = form.get('email');
		const password = form.get('password');

		// get as an array
		let groups = form.get('selectedGroups').split(',');
		groups = groups.filter((group) => group !== '');

		const accountstatus = form.get('accountstatus');

		const editFormData = { username, email, password, groups, accountstatus };

		const response = await fetch(`${USER_URL}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
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
