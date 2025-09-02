import { envVars } from "../config/env";
import { IUser } from "../modules/user/user.interface";
import { generateToken } from "./jwt";

export const createUserToken = (user: Partial<IUser>) => {
      const jwtPayload = {
        email: user.email,
        userId: user._id,
        role: user.role,
      };
    
      const accessToken = generateToken(
        jwtPayload,
        envVars.JWT_ACCESS_SECRET as string,
        envVars.JWT_ACCESS_EXPIRES as string
      );
    
      const refreshToken = generateToken(
        jwtPayload,
        envVars.JWT_REFRESH_SECRET as string,
        envVars.JWT_REFRESH_EXPIRES as string
      );

      return {
        accessToken,
        refreshToken,
      };
}