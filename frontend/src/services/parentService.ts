import api from './api';
import { Parent } from '../types';

export const parentService = {
  getProfile: async (): Promise<Parent> => {
    const res = await api.get<Parent>('/parent/profile');
    return res.data;
  }
};
