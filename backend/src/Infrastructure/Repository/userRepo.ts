import { User } from '../../Database/entity/user.js';
import pool from '../../Database/database.js';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import { Signup } from '../../App/Features/User/SignUp/Types/api.js';
import logger from '../../Logger/index.js';
export const userRepo = {
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      const [rows] = await pool.query<User[]>(
        'SELECT * FROM Users WHERE email = ?',
        [email],
      );
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      logger.error(error, `Error fetching user with email ${email}`);
      throw error;
    }
  },
  findById: async (id: string): Promise<User | null> => {
    try {
      const [rows] = await pool.query<User[]>(
        'SELECT * FROM Users WHERE id = ?',
        [id],
      );
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      logger.error(error, `Error fetching user with id ${id}:`);
      throw error;
    }
  },
  create: async (
    user: Signup.TSignUpReq,
    connection: PoolConnection,
  ): Promise<number> => {
    try {
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO Users (name, email, password, provider, avatar) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, user.password, user.provider, user.avatar],
      );
      return result.insertId;
    } catch (error) {
      logger.error(error, `Error creating user:`);
      throw error;
    }
  },
};
