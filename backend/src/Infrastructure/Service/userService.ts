import { Signup } from '../../App/Features/User/SignUp/Types/api.js';
import pool from '../../Database/database.js';
import { UserExistError } from '../../Errors/errors.js';
import { userRepo } from '../Repository/userRepo.js';
export const userService = {
  signUp: async (userInfoObj: Signup.TSignUpReq): Promise<number> => {
    //  for transaction example purpose
    const connection = await pool.getConnection();
    try {
      const checkUser = await userRepo.findByEmail(userInfoObj.email);
      if (checkUser) {
        throw new UserExistError();
      }
      await connection.beginTransaction();
      const result = await userRepo.create(userInfoObj, connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error('Error signing up:', error);
      throw error;
    } finally {
      connection.release();
    }
  },
};
