import { GROUP_URL } from '../../../constants';

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
				return { success: data.message };
			} else {
				return { error: data.message };
			}
		}

		return { error: 'Group is mandatory' };
	}
};
