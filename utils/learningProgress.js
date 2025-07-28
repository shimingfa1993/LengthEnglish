// 学习进度管理工具类
class LearningProgress {
  static STORAGE_KEYS = {
    USER_PROGRESS: 'userProgress',
    LEARNED_WORDS: 'learnedWords',
    REVIEW_SCHEDULE: 'reviewSchedule',
    LEARNING_STATS: 'learningStats',
    DAILY_TARGET: 'dailyTarget'
  };

  // 初始化用户进度
  static initUserProgress() {
    const defaultProgress = {
      totalWords: 0,
      todayLearned: 0,
      learningStreak: 0,
      lastStudyDate: null,
      level: 'beginner',
      dailyTarget: 10
    };
    
    const existing = uni.getStorageSync(this.STORAGE_KEYS.USER_PROGRESS);
    if (!existing) {
      uni.setStorageSync(this.STORAGE_KEYS.USER_PROGRESS, defaultProgress);
      return defaultProgress;
    }
    return existing;
  }

  // 记录学习单词
  static recordWordLearned(word, difficulty = 'normal') {
    const progress = this.getUserProgress();
    const learnedWords = this.getLearnedWords();
    const today = new Date().toDateString();
    
    // 检查是否是新的一天
    if (progress.lastStudyDate !== today) {
      if (progress.lastStudyDate) {
        const lastDate = new Date(progress.lastStudyDate);
        const currentDate = new Date(today);
        const dayDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          progress.learningStreak += 1;
        } else if (dayDiff > 1) {
          progress.learningStreak = 1;
        }
      } else {
        progress.learningStreak = 1;
      }
      
      progress.todayLearned = 0;
      progress.lastStudyDate = today;
    }
    
    // 记录单词学习
    const wordProgress = {
      word: word,
      learnedAt: Date.now(),
      difficulty: difficulty,
      reviewCount: 0,
      correctCount: 0,
      nextReview: this.calculateNextReview(0)
    };
    
    // 检查是否已学过
    const existingIndex = learnedWords.findIndex(w => w.word === word);
    if (existingIndex === -1) {
      learnedWords.push(wordProgress);
      progress.totalWords += 1;
      progress.todayLearned += 1;
    } else {
      learnedWords[existingIndex] = { ...learnedWords[existingIndex], ...wordProgress };
    }
    
    // 保存数据
    uni.setStorageSync(this.STORAGE_KEYS.USER_PROGRESS, progress);
    uni.setStorageSync(this.STORAGE_KEYS.LEARNED_WORDS, learnedWords);
    
    return progress;
  }

  // 计算下次复习时间（简化版记忆曲线）
  static calculateNextReview(reviewCount) {
    const intervals = [1, 3, 7, 15, 30]; // 天数
    const days = intervals[Math.min(reviewCount, intervals.length - 1)];
    return Date.now() + days * 24 * 60 * 60 * 1000;
  }

  // 获取用户进度
  static getUserProgress() {
    return uni.getStorageSync(this.STORAGE_KEYS.USER_PROGRESS) || this.initUserProgress();
  }

  // 获取已学单词
  static getLearnedWords() {
    return uni.getStorageSync(this.STORAGE_KEYS.LEARNED_WORDS) || [];
  }

  // 获取今日需要复习的单词
  static getTodayReviewWords() {
    const learnedWords = this.getLearnedWords();
    const today = Date.now();
    
    return learnedWords.filter(word => {
      return word.nextReview <= today && word.reviewCount > 0;
    });
  }

  // 获取学习统计
  static getLearningStats() {
    const progress = this.getUserProgress();
    const learnedWords = this.getLearnedWords();
    const reviewWords = this.getTodayReviewWords();
    
    return {
      totalWords: progress.totalWords,
      todayLearned: progress.todayLearned,
      todayTarget: progress.dailyTarget,
      todayProgress: Math.min((progress.todayLearned / progress.dailyTarget) * 100, 100),
      learningStreak: progress.learningStreak,
      reviewCount: reviewWords.length,
      accuracy: this.calculateAccuracy(learnedWords)
    };
  }

  // 计算准确率
  static calculateAccuracy(learnedWords) {
    if (learnedWords.length === 0) return 0;
    
    const totalReviews = learnedWords.reduce((sum, word) => sum + word.reviewCount, 0);
    const totalCorrect = learnedWords.reduce((sum, word) => sum + word.correctCount, 0);
    
    return totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 100;
  }

  // 设置每日目标
  static setDailyTarget(target) {
    const progress = this.getUserProgress();
    progress.dailyTarget = target;
    uni.setStorageSync(this.STORAGE_KEYS.USER_PROGRESS, progress);
  }

  // 记录复习结果
  static recordReviewResult(word, isCorrect) {
    const learnedWords = this.getLearnedWords();
    const wordIndex = learnedWords.findIndex(w => w.word === word);
    
    if (wordIndex !== -1) {
      const wordData = learnedWords[wordIndex];
      wordData.reviewCount += 1;
      
      if (isCorrect) {
        wordData.correctCount += 1;
        wordData.nextReview = this.calculateNextReview(wordData.correctCount);
      } else {
        // 答错了，重置复习间隔
        wordData.nextReview = this.calculateNextReview(0);
      }
      
      uni.setStorageSync(this.STORAGE_KEYS.LEARNED_WORDS, learnedWords);
    }
  }
}

export default LearningProgress;