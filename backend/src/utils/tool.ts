import bcrypt from 'bcryptjs';

export const tool = {
  generateHashPassword: async (password: string): Promise<string> => {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      throw new Error('hash problem: ' + error);
    }
  },
  checkEmail: async (email: string): Promise<boolean> => {
    const emailRegex = /^\w+([-.]\w+)*@[A-Za-z0-9]+([-.]\w+)*\.[A-Za-z]+$/;
    return emailRegex.test(email);
  },
  confirmPassword: async (input: string, real: string): Promise<boolean> => {
    try {
      return await bcrypt.compare(input, real);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  },
};
