import { error, redirect } from '@sveltejs/kit';

// page not found
export const load = async ({ url }) => {
    const validPaths = ['/login', '/user_management', '/profile', '/task_management', '/task_management/applications', '/task_management/kanban'];

    if (url.pathname === '/') {
        redirect(302, '/login');
    } else if (!validPaths.includes(url.pathname)) {
        console.log("22")
        error(404, {
            message: 'Page Not found'
        });
    }
};