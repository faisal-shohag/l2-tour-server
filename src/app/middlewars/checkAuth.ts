import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";

export const checkAuth = (...authRoles: string[]) => async (req:Request, res:Response, next: NextFunction) =>{
    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken) {
            throw new AppError(403, "No Token Recieved!")
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET as string) as JwtPayload;

        // console.log(verifiedToken)
        // console.log(authRoles.includes(verifiedToken.role))
        if(!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "Unauthorized Access!")
        }
        req.user = verifiedToken;
        next()
    } catch (error) {
        console.log("jwt error", error)
        next(error)
    }
}