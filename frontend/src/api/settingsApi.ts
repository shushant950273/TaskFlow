import apiClient from './axios';

export interface UpdateProfilePayload {
  display_name?: string;
  avatar_color?: string;
  avatar_url?: string | null;
}

export const updateProfile = async (data: UpdateProfilePayload) => {
  const res = await apiClient.patch('/auth/me/', data);
  return res.data;
};

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const changePassword = async (data: ChangePasswordPayload) => {
  const res = await apiClient.post('/auth/change-password/', data);
  return res.data;
};
