import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
    if (url.pathname === '/') {
        redirect(302, '/login');
    }
};