import { USER_URL } from '$lib/constants';
import axios from 'axios';
import { error } from '@sveltejs/kit';

// check if admin
export const load = async ({ request }) => {
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
                message: err.response.data.message
            });
        } else {
            error(500, {
                message: 'Internal Server Error'
            });
        }
    }
};