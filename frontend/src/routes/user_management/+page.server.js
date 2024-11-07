import { API_URL } from '$lib/constants';
import axios from 'axios';
import { handleApiError } from '$lib/errorHandler.js';

export const load = async ({ request }) => {
	console.log("USER MANAGEMENT PAGE LOADING")

	try {
		// check if admin
		const response = await axios.get(`${API_URL}/getAdmin`, {
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': request.headers.get('User-Agent'),
				cookie: request.headers.get('cookie')
			}
		});

		// get groups first
		const groupResponse = await axios.get(`${API_URL}/getAllGroups`, {
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': request.headers.get('User-Agent'),
				cookie: request.headers.get('cookie')
			}
		});

		// get users after fetching groups
		const userResponse = await axios.get(`${API_URL}/getAllUsers`, {
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': request.headers.get('User-Agent'),
				cookie: request.headers.get('cookie')
			}
		});

		if (groupResponse.status === 200 && userResponse.status === 200) {
			return {
				username: response.data.data.username,
				email: response.data.data.email,
				isAdmin: response.data.data.isAdmin,
				groupsList: groupResponse.data.data,
				usersList: userResponse.data.data
			};
		}
	} catch (err) {
		return handleApiError(err, false);
	}
};

export const actions = {
	createGroup: async ({ request }) => {
		const form = await request.formData();
		const groupname = form.get('groupname');

		try {
			const response = await axios.post(
				`${API_URL}/createGroup`,
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
			return handleApiError(err);
		}
	},
	createUser: async ({ request }) => {
		const form = await request.formData();

		const username = form.get('username');
		const password = form.get('password');
		const accountstatus = form.get('accountstatus');
		const email = form.get('email');
		let formGroups = form.get('groups');
		const groups = JSON.parse(formGroups);

		try {
			const response = await axios.post(
				`${API_URL}/createUser`,
				{
					username,
					email,
					password,
					groups,
					accountstatus
				},
				{
					headers: {
						'Cache-Control': 'no-cache, no-store, must-revalidate',
						Pragma: 'no-cache',
						Expires: '0',
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
			return handleApiError(err);
		}
	},
	editUser: async ({ request }) => {
		const form = await request.formData();

		const username = form.get('username');
		const password = form.get('password');
		const accountstatus = form.get('accountstatus');
		const email = form.get('email');
		let groups = JSON.parse(form.get('groups'));

		if (username == 'admin') {
			if (!groups.includes('admin')) {
				groups = [...groups, 'admin'];
			}
		}

		try {
			const response = await axios.put(
				`${API_URL}/editUser`,
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
			return handleApiError(err);
		}
	}
};
