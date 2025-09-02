import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewars/globalErrorHandlers";
import { notFound } from "./app/middlewars/notFound";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import './app/config/passport';

const app = express();


app.use(
  expressSession({
    secret: "session-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is runing fine....!",
  });
});

app.use(globalErrorHandler);
app.use(notFound);
export default app;
