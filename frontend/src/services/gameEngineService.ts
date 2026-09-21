import api from './api';

export const gameEngineService = {
  getGameConfig: async (activityId: number) => {
    const response = await api.get(`/student/game/config/${activityId}`);
    return response.data;
  },

  submitGameAnswers: async (activityId: number, answers: any) => {
    const response = await api.post(`/student/game/submit/${activityId}`, { answers });
    return response.data;
  }
};
