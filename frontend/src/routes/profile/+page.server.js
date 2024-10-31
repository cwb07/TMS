import { USER_URL } from '../../../constants';

export const actions = {
    default: async ({ request }) => {
        const form = await request.formData();

        const email = form.get('email');
        const password = form.get('password');
        const username = form.get('username');

        const formData = { email, password };

        if (email.trim().length === 0 && password.trim().length === 0) {
            return { error: 'Please enter either a email or password', formData };
        }

        // email regex if user did enter email (optional)
        const emailRegex = /^[^\s]+@[^\s]+\.com$/;

        if (email && !emailRegex.test(email)) {
            return { error: 'Invalid email format', formData };
        }

        // password regex
        // min 8 char & max 10 char consisting of alphabets, numbers and special characters
        const passwordRegex = /^[^\s]{8,10}$/;

        if (password && !passwordRegex.test(password)) {
            return { error: 'Invalid password format', formData };
        }

        const response = await fetch(`${USER_URL}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: data.message };
        } else {
            return { error: data.message, formData };
        }
    }
};
