import { redirect } from '@sveltejs/kit';

export const load = async ({ url, depends }) => {
    depends('loadTaskManagement');

    const user = "admin"
    const currentPath = url.pathname;

    if (user === "admin" && !currentPath.startsWith('/task_management/applications')) {
        redirect(302, '/task_management/applications');
    } else if (user !== "admin" && !currentPath.startsWith('/task_management/kanban')) {
        redirect(302, '/task_management/kanban');
    }

    return {}
};