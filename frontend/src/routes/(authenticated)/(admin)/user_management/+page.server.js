import { GROUP_URL, USER_URL } from '$lib/constants';
import axios from 'axios';

export const load = async ({ request, depends }) => {
	depends("loadUserManagement");

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
};