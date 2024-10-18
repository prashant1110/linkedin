import express from "express";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import connectionRoute from "./routes/connectionRoute.js";
import { connectDB } from "./lib/db.js";
import dotennv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
dotennv.config();
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/connections", connectionRoute);

app.listen(PORT, () => {
  console.log(`Server starte at port ${PORT}`);
  connectDB();
});
