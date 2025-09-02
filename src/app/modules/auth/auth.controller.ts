/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookies";
import { JwtPayload } from "jsonwebtoken";
import { createUserToken } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import passport from "passport";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const loginInfo = await AuthServices.credentialsLogin(req.body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        // return next(err);
        return next(new AppError(401, err));
      }

      if (!user) {
        return next(new AppError(401, info.message));
      }
      const { accessToken, refreshToken } = await createUserToken(user);

      const { password: pwd, ...others } = user.toObject();

      setAuthCookie(res, { accessToken, refreshToken });
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Logged in successfully!!",
        data: { accessToken, refreshToken, user: others },
      });
    })(req, res, next);
  }
);

const createNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(httpStatus.BAD_REQUEST, "Refresh token not found");
    }
    const tokens = await AuthServices.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokens);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Brand new access token created!!",
      data: tokens,
    });
  }
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Logged out successfully!!",
      data: {},
    });
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const oldPassword = req.body.oldPassword;
    const newPassowrd = req.body.password;
    const decodedToken = req.user;

    await AuthServices.resetPassword(
      oldPassword,
      newPassowrd,
      decodedToken as JwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password changed successfully!!",
      data: {},
    });
  }
);

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirect = (req.query.state as string) || "";

    if (redirect.startsWith("/")) {
      redirect = redirect.slice(1);
    }

    const user = req.user;
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    }

    const tokens = createUserToken(user);
    setAuthCookie(res, tokens);

    res.redirect(`${envVars.FRONTEND_URL as string}/${redirect}`);
  }
);

export const AuthControllers = {
  credentialsLogin,
  createNewAccessToken,
  logout,
  resetPassword,
  googleCallbackController,
};
