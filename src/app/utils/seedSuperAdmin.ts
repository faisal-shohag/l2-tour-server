import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface"
import { User } from "../modules/user/user.model"
import bcryptjs from 'bcryptjs'

export const seedSuperAdmin = async () => {
   try {
    const isSuperAdmin = await User.findOne({email: envVars.SUPER_ADMIN_EMAIL})
    if(isSuperAdmin){
      console.log("Super admin already exists");
      return;
    }

    console.log('Trying to create super admin.....')

    const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD as string, Number(envVars.BCRYPT_SALT_ROUND))
    const authProvider:IAuthProvider = {
      provider: 'credentials',
      providerId: envVars.SUPER_ADMIN_EMAIL as string,
    }

      const payload:IUser = {
            name: 'Super Admin',
            email: envVars.SUPER_ADMIN_EMAIL as string,
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            isVerified: true,
            auths: [authProvider]
        }
        const superAdmin = await User.create(payload)

       console.log("Super admin created successfully", superAdmin)


   } catch (error) {
    console.log("Super admin creation failed", error)
   }
}