// Custom CORS middleware — only allow requests from https://myvelvetloop.com
const allowedOrigin = "https://www.myvelvetloop.com";

export default function corsMiddleware(req, res, next) {
	const origin = req.headers.origin;

	// If the request origin matches the allowed origin, set CORS headers.
	if (origin === allowedOrigin) {
		res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
		// Helps caches/proxies know the response varies by Origin
		res.setHeader("Vary", "Origin");
		res.setHeader(
			"Access-Control-Allow-Methods",
			"GET,POST,PUT,PATCH,DELETE,OPTIONS"
		);
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Content-Type,Authorization,token"
		);
		res.setHeader("Access-Control-Allow-Credentials", "true");
	}

	// Handle preflight requests quickly
	if (req.method === "OPTIONS") {
		return res.sendStatus(204);
	}

	next();
}
