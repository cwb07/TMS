import { redirect } from '@sveltejs/kit';

export const load = async ({ url, parent }) => {
	const user = await parent();
	const currentPath = url.pathname;

	if (user.isAdmin && !currentPath.startsWith('/task_management/applications')) {
		redirect(302, '/task_management/applications');
	} else if (!user.isAdmin && !currentPath.startsWith('/task_management/kanban')) {
		redirect(302, '/task_management/kanban');
	}

	return {};
};
