// corsConfig.js
import cors from "cors";

const corsOptions = {
	origin: "https://www.myvelvetloop.com", // allow only this domain
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"], // allowed HTTP methods
	// include the custom 'token' header your frontend sends, plus common headers
	allowedHeaders: [
		// "Content-Type",
		// "Authorization",
		// "token",
		// "x-requested-with",
		"*"
	], // allowed headers
	credentials: true, // if you need cookies / auth headers
};

export default cors(corsOptions);
