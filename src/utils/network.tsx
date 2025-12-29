import { BACKEND_URL } from "./constants";
import { CustomError, ERRORS } from "./errors";

export async function get(url: string, options: any = {}) : Promise<any> {
	try {
		let token = typeof window !== 'undefined' ? localStorage.getItem('x-access-token') : null;
		const headers = new Headers(options.headers || {});
		
		if (token) {
			headers.set('x-access-token', token);
		}
		headers.set('Content-Type', 'application/json');
		const updatedOptions: RequestInit = {
			...options,
			headers,
		};

		const response = await fetch(`${BACKEND_URL}${url}`, {
			method: 'GET',
			...updatedOptions,
		});
		const result = await response.json();
		if (!result.success) {
			throw new CustomError(result.error.message, result.error.code);
		}
		return result.data;
	} catch (error) {
		if (error instanceof CustomError) {
			throw error;
		}
		throw ERRORS.SERVER_ERROR
	}
}

export async function post(url: string, body: any, options: any = {}): Promise<any> {
	try {
		let token = typeof window !== 'undefined' ? localStorage.getItem('x-access-token') : null;
		const headers = new Headers(options.headers || {});
		
		if (token) {
			headers.set('x-access-token', token);
		}
		headers.set('Content-Type', 'application/json');
		const updatedOptions: RequestInit = {
			...options,
			headers,
			body: JSON.stringify(body),
		};

		const response = await fetch(`${BACKEND_URL}${url}`, {
			method: 'POST',
			...updatedOptions,
		});
		const result = await response.json();
		if (!result.success) {
			throw new CustomError(result.error.message, result.error.code);
		}
		return result.data;
	} catch (error) {
		if (error instanceof CustomError) {
			throw error;
		}
		throw ERRORS.SERVER_ERROR;
	}
}


export async function put(url: string, body: any, options: any = {}) : Promise<any> {
	try {
		let token = typeof window !== 'undefined' ? localStorage.getItem('x-access-token') : null;
		const headers = new Headers(options.headers || {});
		
		if (token) {
			headers.set('x-access-token', token);
		}
		headers.set('Content-Type', 'application/json');
		const updatedOptions: RequestInit = {
			...options,
			headers,
			body: JSON.stringify(body),
		};

		const response = await fetch(`${BACKEND_URL}${url}`, {
			method: 'PUT',
			...updatedOptions,
		});
		const result = await response.json();
		if (!result.success) {
			throw new CustomError(result.error.message, result.error.code);
		}
		return result.data;
	} catch (error) {
		if (error instanceof CustomError) {
			throw error;
		}
		throw ERRORS.SERVER_ERROR;
	}
}

export async function uploadImage(url: string): Promise<string> {
	try {
		const formData = new FormData();
		let enFile = await fetch(url).then(r => r.blob())
		formData.append("photo", enFile);
		let token = typeof window !== 'undefined' ? localStorage.getItem('x-access-token') : null;
		if (!token) {
			throw ERRORS.UNAUTHORIZED;
		}
		const response = await fetch(`${BACKEND_URL}/upload/admin`, {
			method: 'POST',
			body: formData,
			headers: {
				'x-access-token': token,
			},
		});
		const result = await response.json();
		if (!result.success) {
			throw new CustomError(result.error.message, result.error.code);
		}
		return result.data.url;
	} catch (error) {
		if (error instanceof CustomError) {
			throw error;
		}
		throw ERRORS.SERVER_ERROR;
	}
}





export async function del(url: string, options: any = {}) : Promise<any> {
	try {
		let token = typeof window !== 'undefined' ? localStorage.getItem('x-access-token') : null;
		const headers = new Headers(options.headers || {});
		
		if (token) {
			headers.set('x-access-token', token);
		}
		headers.set('Content-Type', 'application/json');
		const updatedOptions: RequestInit = {
			...options,
			headers,
		};

		const response = await fetch(`${BACKEND_URL}${url}`, {
			method: 'DELETE',
			...updatedOptions,
		});
		const result = await response.json();
		if (!result.success) {
			throw new CustomError(result.error.message, result.error.code);
		}
		return result.data;
	} catch (error) {
		if (error instanceof CustomError) {
			throw error;
		}
		throw ERRORS.SERVER_ERROR
	}
}