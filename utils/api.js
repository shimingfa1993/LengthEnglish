// API 配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-app.vercel.app' 
  : 'http://localhost:3000';

// API 请求封装
const request = (url, options = {}) => {
  const token = uni.getStorageSync('token');
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
};

// API 方法
export const api = {
  // 用户注册
  register: (data) => request('/api/register', {
    method: 'POST',
    data
  }),
  
  // 用户登录
  login: (data) => request('/api/login', {
    method: 'POST',
    data
  }),
  
  // 获取学习统计
  getLearningStats: () => request('/api/learning/stats'),
  
  // 记录学习
  recordLearning: (data) => request('/api/learning/record', {
    method: 'POST',
    data
  }),
  
  // 获取复习单词
  getReviewWords: () => request('/api/learning/review-words'),
  
  // 提交复习结果
  submitReviewResult: (data) => request('/api/learning/review-result', {
    method: 'POST',
    data
  })
};