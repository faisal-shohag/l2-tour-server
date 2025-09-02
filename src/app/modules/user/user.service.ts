import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatusCode from "http-status-codes";
import becryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUserService = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatusCode.BAD_REQUEST, "User already exist");
  }
  const hashedPassword = becryptjs.hashSync(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProver: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProver],
    ...rest,
  });

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
    const isUserExist = await User.findById(userId);
    if (!isUserExist) {
      throw new AppError(httpStatusCode.NOT_FOUND, "User does not exist");
    }

    // if(isUserExist.isDeleted || isUserExist.isActive === IsActive.BLOCKED) {
    //   throw new AppError(httpStatusCode.FORBIDDEN, "User is not active");
    // }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(
        httpStatusCode.FORBIDDEN,
        "You are not authorized to update role"
      );
    }

    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(
        httpStatusCode.FORBIDDEN,
        "You are not authorized to update role"
      );
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(
        httpStatusCode.FORBIDDEN,
        "You are not authorized to update role"
      );
    }
  }
  if (payload.password) {
    const hashedPassword = await becryptjs.hash(
      payload.password,
      Number(envVars.BCRYPT_SALT_ROUND)
    );
    payload.password = hashedPassword;
  }
  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
  })
  // .select("-password")

  return newUpdatedUser;


};

const getAllUsers = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();
  return {
    users,
    meta: {
      page: 1,
      limit: 1,
      total: totalUsers,
    },
  };
};

export const UserServices = {
  createUserService,
  getAllUsers,
  updateUser
};
