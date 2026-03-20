import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";

const port = process.env.PORT;

// db connection
connectDB();

app.listen(port, () =>
	console.log(`Server started on http://localhost:${port}`)
);
