import { GROUP_URL, USER_URL } from '$lib/constants';

import axios from 'axios';
import { error } from '@sveltejs/kit';

export const load = async ({ request, depends }) => {
	depends("loadFetchGroupsUsers");

	try {
		// get groups first
		const groupResponse = await axios.get(
			`${GROUP_URL}`,
			{
				headers: {
					'Content-Type': 'application/json',
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
		// user not admin show forbidden page
		if (err.response.status === 403) {
			error(403, {
				message: err.response.data.message,
				redirectToTMS: true
			});
		} else if (err.response.status === 401) {
			error(401, {
				message: err.response.data.message,
				redirectToLogin: true
			});
		} else {
			error(500, {
				message: 'Internal Server Error'
			});
		}
	}
};