import { USER_URL } from '$lib/constants';
import axios from 'axios';
import { error } from '@sveltejs/kit';

// check if admin
export const load = async ({ request, depends }) => {
    depends("loadAdminCheck")

    try {
        await axios.get(
            `${USER_URL}/admin`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    cookie: request.headers.get('cookie')
                }
            }
        );
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