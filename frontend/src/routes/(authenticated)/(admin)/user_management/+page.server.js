import { GROUP_URL, USER_URL } from '$lib/constants';

import axios from 'axios';
import { handleApiError } from '$lib/errorHandler.js';

export const load = async ({ request }) => {
	try {
		// get groups first
		const groupResponse = await axios.get(
			`${GROUP_URL}`,
			{
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': request.headers.get('User-Agent'),
					cookie: request.headers.get('cookie')
				}
			}
		);

		// get users after fetching groups
		const userResponse = await axios.get(
			`${USER_URL}/all`,
			{
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': request.headers.get('User-Agent'),
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
	} catch (err) {
		return handleApiError(err, false)
	}
};

export const actions = {
	createGroup: async ({ request }) => {
		const form = await request.formData();
		const groupname = form.get('groupname');

		try {
			const response = await axios.post(
				`${GROUP_URL}`,
				{ groupname },
				{
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': request.headers.get('User-Agent'),
						cookie: request.headers.get('cookie')
					}
				}
			);

			if (response.status === 201) {
				return {
					successMessage: response.data.message,
					errorMessage: '',
					resetCreateGroupForm: true
				};
			}
		} catch (err) {
			return handleApiError(err)
		}
	},
	createUser: async ({ request }) => {
		const form = await request.formData();

		const username = form.get('username');
		const password = form.get('password');
		const accountstatus = form.get('accountstatus');
		const email = form.get('email');
		let groups = JSON.parse(form.get('groups'))

		try {
			const response = await axios.post(
				`${USER_URL}`,
				{
					username,
					email,
					password,
					groups,
					accountstatus
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': request.headers.get('User-Agent'),
						cookie: request.headers.get('cookie')
					}
				}
			);

			if (response.status === 201) {
				return {
					successMessage: response.data.message,
					errorMessage: '',
					resetCreateUserForm: true
				};
			}
		} catch (err) {
			return handleApiError(err)
		}
	},
	editUser: async ({ request }) => {
		const form = await request.formData();

		const username = form.get('username');
		const password = form.get('password');
		const accountstatus = form.get('accountstatus');
		const email = form.get('email');
		let groups = JSON.parse(form.get('groups'))

		if (username == "admin") {
			if (!groups.includes('admin')) {
				groups = [...groups, 'admin'];
			}
		}

		try {
			const response = await axios.put(
				`${USER_URL}/edit`,
				{
					username,
					email,
					password,
					groups,
					accountstatus
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': request.headers.get('User-Agent'),
						cookie: request.headers.get('cookie')
					}
				}
			);

			if (response.status === 200) {
				return {
					successMessage: response.data.message,
					errorMessage: '',
					resetEditUserForm: true
				};
			}
		} catch (err) {
			return handleApiError(err)
		}
	}
};