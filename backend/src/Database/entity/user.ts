// src/entities/User.ts

import { RowDataPacket } from 'mysql2/promise';

export interface User extends RowDataPacket {
  id?: number;
  name: string;
  provider?: 'native' | 'google';
  email: string;
  password?: string;
  avatar?: string;
  role?: string;
  createdAt?: Date;
  isActive?: boolean;
}
