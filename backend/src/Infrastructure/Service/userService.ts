import { Signin } from '../../App/Features/User/SignIn/Types/api.js';
import { Signup } from '../../App/Features/User/SignUp/Types/api.js';
import pool from '../../Database/database.js';
import { UserExistError, UserNotFoundError } from '../../Errors/errors.js';
import logger from '../../Logger/index.js';
import { Pmap } from '../../Types/common.js';
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
      logger.error(error, 'Error signing up:');
      throw error;
    } finally {
      connection.release();
    }
  },
  oauthSignUp: async (
    email: string,
    name: string,
    provider: Pmap.TProvider,
    avatar: string,
  ): Promise<number> => {
    //  for transaction example purpose
    const connection = await pool.getConnection();
    try {
      const checkUser = await userRepo.findByEmail(email);
      if (checkUser && checkUser.id) {
        return checkUser.id;
      }
      await connection.beginTransaction();

      const result = await userRepo.create(
        {
          name,
          email,
          provider,
          avatar,
          password: null,
        },
        connection,
      );
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      logger.error(error, 'Error signing up by OAuth:');
      throw error;
    } finally {
      connection.release();
    }
  },
  signIn: async (email: string): Promise<Signin.ISignInDto> => {
    //  for transaction example purpose
    const checkUserExist = await userRepo.findByEmail(email);
    if (!checkUserExist) {
      throw new UserNotFoundError();
    }
    console.log('checkUserExist', checkUserExist);
    return {
      id: checkUserExist.id,
      email: checkUserExist.email,
      password: checkUserExist.password,
      image: checkUserExist.avatar,
      name: checkUserExist.name,
    };
  },
};
