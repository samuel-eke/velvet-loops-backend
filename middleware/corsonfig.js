// corsConfig.js
import cors from "cors";

const corsOptions = {
  origin: "https://www.myvelvetloop.com", // allow only this domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // allowed headers
  credentials: true, // if you need cookies / auth headers
};

export default cors(corsOptions);
