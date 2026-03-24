import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 使用 window.location 而不是 location
        if (typeof window.location !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API 方法
export const authAPI = {
  register: (phone: string, nickname: string, code?: string) =>
    api.post('/user/register', { phone, nickname, code }),
  login: (phone: string, code?: string) =>
    api.post('/user/login', { phone, code }),
  loginByCode: (phone: string, code: string) =>
    api.post('/user/login-by-code', { phone, code }),
  sendCode: (phone: string) =>
    api.post('/user/send-code', { phone }),
  getWxQrcode: () =>
    api.get('/user/wx/qrcode'),
  pollWxLogin: (sessionId: string) =>
    api.get(`/user/wx/poll/${sessionId}`),
  wxScanDemo: (sessionId: string, phone: string, action: 'scan' | 'confirm' | 'expire') =>
    api.post('/user/wx/scan-demo', { sessionId, phone, action }),
  getUserInfo: () =>
    api.get('/user/info'),
  getUserById: (id: string) =>
    api.get(`/user/${id}`),
  updateUser: (data: any) =>
    api.put('/user/update', data),
};

export const contentAPI = {
  getFeed: (page = 1, limit = 10) =>
    api.get(`/content/feed?page=${page}&limit=${limit}`),
  getDetail: (id: string) =>
    api.get(`/content/${id}`),
  search: (q: string, type: 'content' | 'user' = 'content', page = 1) =>
    api.get(`/content/search?q=${encodeURIComponent(q)}&type=${type}&page=${page}`),
  publish: (data: { title: string; content: string; images?: string[]; tags?: string[] }) =>
    api.post('/content', data),
  delete: (id: string) =>
    api.delete(`/content/${id}`),
  getUserContents: (userId: string, page = 1) =>
    api.get(`/content/user/${userId}?page=${page}`),
  addComment: (contentId: string, content: string, parentId?: string) =>
    api.post(`/content/${contentId}/comment`, { content, parentId }),
  getComments: (contentId: string) =>
    api.get(`/content/${contentId}/comments`),
  getTopics: () =>
    api.get('/content/topic/list'),
};

export const socialAPI = {
  like: (contentId: string) =>
    api.post('/social/like', { contentId }),
  collect: (contentId: string) =>
    api.post('/social/collect', { contentId }),
  follow: (userId: string) =>
    api.post('/social/follow', { userId }),
  getFollowing: () =>
    api.get('/social/following'),
  getFollowers: () =>
    api.get('/social/followers'),
  getCollections: () =>
    api.get('/social/collections'),
  getNotifications: () =>
    api.get('/social/notifications'),
  markNotificationsRead: () =>
    api.put('/social/notifications/read'),
  sendMessage: (receiverId: string, content: string) =>
    api.post('/social/message', { receiverId, content }),
  getMessages: () =>
    api.get('/social/messages'),
  getChatMessages: (userId: string) =>
    api.get(`/social/message/${userId}`),
};

export const aiAPI = {
  generateRecipe: (imageUrl: string) =>
    api.post('/ai/generate-recipe', { imageUrl }),
  generateTitle: (content: string) =>
    api.post('/ai/generate-title', { content }),
  generateCoverPrompt: (content: string) =>
    api.post('/ai/generate-cover-prompt', { content }),
  generateTags: (content: string, imageUrl?: string) =>
    api.post('/ai/generate-tags', { content, imageUrl }),
  polishContent: (content: string) =>
    api.post('/ai/polish-content', { content }),
  voiceToText: (audioUrl: string) =>
    api.post('/ai/voice-to-text', { audioUrl }),
  modifyContent: (content: string, instruction: string) =>
    api.post('/ai/modify-content', { content, instruction }),
  nutritionAnalysis: (ingredients: string[]) =>
    api.post('/ai/nutrition-analysis', { ingredients }),
  similarRecipes: (contentId: string) =>
    api.post('/ai/similar-recipes', { contentId }),
};

export default api;
