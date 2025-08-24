import express, {Request, Response } from "express";
import cors from "cors"
import { router } from "./app/routes"
import { globalErrorHandler } from "./app/middlewars/globalErrorHandlers";
import { notFound } from "./app/middlewars/notFound";
const app = express();

app.use(express.json())
app.use(cors());

app.use("/api/v1", router)

app.get('/', (req: Request, res: Response) => {
   res.status(200).json({
    message: "Server is runing fine....!"
   })
})

app.use(globalErrorHandler)
app.use(notFound)
export default app