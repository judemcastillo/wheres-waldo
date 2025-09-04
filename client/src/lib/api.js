const BASE = import.meta.env.VITE_API_URL;

export function setToken(token) {
	if (token) localStorage.setItem("token", token);
	else localStorage.removeItem("token");
}

function authHeaders() {
	const authorizationToken = localStorage.getItem("token");
	return authorizationToken
		? { Authorization: `Bearer ${authorizationToken}` }
		: {};
}

export async function api(path, options = {}) {
	const res = await fetch(`${BASE}${path}`, {
		headers: {
			"Content-Type": "application/json",
			...authHeaders(),
			...(options.headers || {}),
		},
		...options,
	});
	if (!res.ok) throw new Error((await res.json()).message || res.statusText);
	return res.json();
}

export function getToken() {
	return localStorage.getItem("token");
}

export function isAuthed() {
	return !!getToken();
}

export function logout() {
	localStorage.removeItem("token");
}

function base64UrlDecode(str) {
	// Convert base64url to base64
	let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	// Add padding if missing
	while (base64.length % 4) {
		base64 += "=";
	}
	return atob(base64);
}

function decodeJwt(token) {
	try {
		const [, payload] = token.split("."); // skip header, get payload
		const json = base64UrlDecode(payload);
		return JSON.parse(json);
	} catch {
		return null;
	}
}

export function getUser() {
	const token = getToken();
	const payload = token ? decodeJwt(token) : null;
	if (!payload) return null;
	return {
		id: payload.sub ?? null,
		email: payload.email ?? null,
		name: payload.name ?? null,
		roles: payload.roles ?? null,
  };
}
