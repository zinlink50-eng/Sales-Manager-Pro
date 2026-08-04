import express from "express";
import cors from "cors";
import session from "express-session";
import routes from "./routes.js";

const app = express();
const PORT = 3001;

app.use(express.json());
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
