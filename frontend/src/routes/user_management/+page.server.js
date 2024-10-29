import { GROUP_URL, USER_URL } from '../../../constants';

export const load = async () => {
	const response = await fetch(`${GROUP_URL}`);
	const data = await response.json();

	if (response.ok) {
		return { groups: data.data };
	}
};

export const actions = {
	createGroup: async ({ request }) => {
		const form = await request.formData();
		const groupname = form.get('groupname');

		if (groupname) {
			// max 50 characters, alphanumeric with possible underscore
			const groupnameRegex = /^[a-zA-Z0-9_]{1,50}$/;

			if (!groupnameRegex.test(groupname)) {
				return { error: 'Invalid group format' };
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
				return { error: data.message };
			}
		}

		return { error: 'Group is mandatory' };
	},
	createUser: async ({ request }) => {
		const form = await request.formData();

		const username = form.get('username');
		const email = form.get('email');
		const password = form.get('password');
		const groups = form.getAll('groups[]');
		const accountstatus = form.get('accountstatus');

		// username, password and status must be filled
		if (!username) {
			return { error: 'Username is mandatory' };
		}

		if (!password) {
			return { error: 'Password is mandatory' };
		}

		if (!accountstatus) {
			return { error: 'Active is mandatory' };
		}

		// username regex
		// max 50 characters, alphanumeric with no spaces
		const usernameRegex = /^[a-zA-Z0-9]{1,50}$/;

		if (!usernameRegex.test(username)) {
			return { error: 'Username must be alphanumeric' };
		}

		// password regex
		// min 8 char & max 10 char consisting of alphabets, numbers and special characters
		const passwordRegex = /^[^\s]{8,10}$/;

		if (!passwordRegex.test(password)) {
			return { error: 'Invalid password format' };
		}

		// email regex if user did enter email (optional)
		const emailRegex = /^[^\s]+@[^\s]+.com$/;

		if (email && !emailRegex.test(email)) {
			return { error: 'Invalid email format' };
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
			return { error: data.message };
		}
	}
};
