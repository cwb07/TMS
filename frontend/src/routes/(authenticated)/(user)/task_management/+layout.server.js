import { redirect } from '@sveltejs/kit';

export const load = async ({ url, depends, parent }) => {
    depends('loadTaskManagement');

    const user = await parent();
    const currentPath = url.pathname;

    if (user.isPl && !currentPath.startsWith('/task_management/applications')) {
        redirect(302, '/task_management/applications');
    } else if (!user.isPl && !currentPath.startsWith('/task_management/kanban')) {
        redirect(302, '/task_management/kanban');
    }
};