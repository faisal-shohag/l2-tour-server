import httpStatus from "http-status-codes";
import { IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import becryptjs from "bcryptjs";
import { createUserToken } from "../../utils/userTokens";
import { verifyToken } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  const isPasswordMatched = await becryptjs.compare(
    password as string,
    user.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password does not match");
  }

  const {accessToken, refreshToken} = createUserToken(user)



  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pwd, ...others } = user.toObject();
  return {
    user: others,
    accessToken,
    refreshToken,
  };
};

const getNewAccessToken = async (refreshToken:string) => {
  const verifiedRefreshToken = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;

  const user = await User.findOne({ email: verifiedRefreshToken.email });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  if(user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is blocked/inactive");
  }

    if(user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User was deleted...!");
  }
 

  const {accessToken} = createUserToken(user)

  return {
    accessToken,
  };
};

const resetPassword = async (oldPassword:string, newPassowrd:string, decodedToken:JwtPayload) => {
  
  const user = await User.findById(decodedToken.userId);
  
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  
  const isPasswordMatched = await becryptjs.compare(
    oldPassword,
    user.password as string,
  );
  if(!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match");
  }

  user.password = await becryptjs.hash(newPassowrd, Number(envVars.BCRYPT_SALT_ROUND));

  await user.save();

  return true;

};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  resetPassword
};
