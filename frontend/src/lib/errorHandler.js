import { error } from '@sveltejs/kit';

export function handleApiError(err, showMessages = true) {
	const status = err.response.status;
	const message = err.response.data.message;

	switch (status) {
		case 401:
			error(401, { message, redirectToLogin: true });
			break;
		case 403:
			error(403, { message, redirectToTMS: true });
			break;
		case 500:
			error(500, { message: err.response });
			break;
		default:
			if (showMessages) {
				return {
					successMessage: '',
					errorMessage: message
				};
			} else {
				error(500, { message: 'Internal Server Error' });
				break;
			}
	}
}
