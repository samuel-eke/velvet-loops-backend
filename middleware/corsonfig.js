// corsConfig.js
import cors from "cors";

const allowedOrigins = ["https://www.myvelvetloop.com", "https://admin.myvelvetloop.com"]

const corsOptions = {
	origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // allow request
    } else {
      callback(new Error("Not allowed by CORS")); // block request
    }
  },
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
