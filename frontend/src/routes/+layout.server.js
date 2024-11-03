import { error, redirect } from '@sveltejs/kit';

// page not found
export const load = async ({ url }) => {
    const validPaths = ['/login', '/user_management', '/profile', '/logout'];

    if (url.pathname === '/') {
        redirect(302, '/login');
    } else if (!validPaths.includes(url.pathname)) {
        error(404, {
            message: 'Page Not found'
        });
    }
};