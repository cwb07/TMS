import { USER_URL } from '$lib/constants';
import axios from 'axios';
import { handleApiError } from '$lib/errorHandler.js';

export const actions = {
    default: async ({ request }) => {
        const form = await request.formData();

        const username = form.get('username');
        const email = form.get('email');
        const password = form.get('password');

        try {
            const response = await axios.put(
                `${USER_URL}`,
                { username, email, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': request.headers.get('User-Agent'),
                        cookie: request.headers.get('cookie')
                    }
                }
            );

            if (response.status === 200) {
                return {
                    successMessage: response.data.message,
                    errorMessage: '',
                    resetUpdateProfileForm: true
                };
            }
        } catch (err) {
            return handleApiError(err)
        }
    }
};