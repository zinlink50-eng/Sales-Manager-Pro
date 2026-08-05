import express from "express";
import cors from "cors";
import session from "express-session";
import routes from "./routes.js";

const app = express();
const PORT = 3001;

// Allow large base64-encoded product images (raw base64 is ~1.33× the file size)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({ origin: true, credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sales-manager-pro-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
