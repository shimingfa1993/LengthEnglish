class LearningProgress {
  static API_BASE = 'http://localhost:3000/api'; // 开发环境
  // static API_BASE = 'https://your-app.vercel.app/api'; // 生产环境
  
  // 获取token
  static getToken() {
    return uni.getStorageSync('userToken');
  }
  
  // API请求封装
  static async apiRequest(url, options = {}) {
    const token = this.getToken();
    
    try {
      const response = await uni.request({
        url: `${this.API_BASE}${url}`,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('API请求失败:', error);
      // 网络错误时使用本地数据
      return this.getLocalFallback(url);
    }
  }
  
  // 获取学习统计（优先服务器，降级本地）
  static async getLearningStats() {
    try {
      const serverStats = await this.apiRequest('/learning/stats');
      if (serverStats && !serverStats.error) {
        // 同步到本地缓存
        uni.setStorageSync('cachedStats', serverStats);
        return serverStats;
      }
    } catch (error) {
      console.log('使用本地数据');
    }
    
    // 降级到本地数据
    return this.getLocalStats();
  }
  
  // 记录学习（双写：服务器+本地）
  static async recordWordLearned(word, difficulty = 'normal') {
    // 先更新本地
    const localResult = this.recordWordLearnedLocal(word, difficulty);
    
    // 异步同步到服务器
    try {
      await this.apiRequest('/learning/record', {
        method: 'POST',
        data: { word, difficulty }
      });
    } catch (error) {
      console.log('服务器同步失败，已保存到本地');
    }
    
    return localResult;
  }
  
  // 本地降级方法
  static getLocalStats() {
    const progress = uni.getStorageSync('userProgress') || {};
    return {
      totalWords: progress.totalWords || 0,
      todayLearned: progress.todayLearned || 0,
      todayTarget: progress.dailyTarget || 10,
      todayProgress: 0,
      learningStreak: progress.learningStreak || 0,
      reviewCount: 0
    };
  }
  
  // 本地记录方法（保持原有逻辑）
  static recordWordLearnedLocal(word, difficulty) {
    // ... 原有的本地存储逻辑
  }
}

// 添加导出语句
export default LearningProgress;
export { LearningProgress };