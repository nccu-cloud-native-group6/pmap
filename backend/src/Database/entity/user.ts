// src/entities/User.ts

import { RowDataPacket } from 'mysql2/promise';

export interface User extends RowDataPacket {
  id?: number;
  name: string;
  provider: 'native' | 'google' | 'github';
  email: string;
  password: string | null;
  avatar: string | null;
  role: 'admin' | 'user';
  createdAt?: Date;
  isActive?: boolean;
}
