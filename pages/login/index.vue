<template>
  <view class="login-container">
    <view class="header">
      <text class="title">英语学习助手</text>
      <text class="subtitle">登录或注册开始学习</text>
    </view>
    
    <view class="form-container">
      <view class="tab-bar">
        <view class="tab-item" :class="{active: isLogin}" @click="switchToLogin">登录</view>
        <view class="tab-item" :class="{active: !isLogin}" @click="switchToRegister">注册</view>
      </view>
      
      <view class="form">
        <view class="input-group">
          <input 
            class="input" 
            type="text" 
            placeholder="用户名" 
            v-model="username"
            maxlength="20"
          />
        </view>
        
        <view class="input-group">
          <input 
            class="input" 
            type="password" 
            placeholder="密码" 
            v-model="password"
            maxlength="20"
          />
        </view>
        
        <button 
          class="submit-btn" 
          @click="handleSubmit"
          :disabled="loading || !username || !password"
        >
          <text v-if="loading">{{ isLogin ? '登录中...' : '注册中...' }}</text>
          <text v-else>{{ isLogin ? '登录' : '注册' }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { api } from '@/utils/api.js';

export default {
  data() {
    return {
      isLogin: true,
      username: '',
      password: '',
      loading: false
    };
  },
  
  onLoad() {
    // 检查是否已登录
    const token = uni.getStorageSync('token');
    if (token) {
      this.redirectToHome();
    }
  },
  
  methods: {
    switchToLogin() {
      this.isLogin = true;
      this.clearForm();
    },
    
    switchToRegister() {
      this.isLogin = false;
      this.clearForm();
    },
    
    clearForm() {
      this.username = '';
      this.password = '';
    },
    
    async handleSubmit() {
      if (!this.username || !this.password) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
      
      this.loading = true;
      
      try {
        const data = {
          username: this.username,
          password: this.password
        };
        
        let result;
        if (this.isLogin) {
          result = await api.login(data);
        } else {
          result = await api.register(data);
        }
        
        // 保存token和用户信息
        uni.setStorageSync('token', result.token);
        uni.setStorageSync('userId', result.userId);
        
        uni.showToast({
          title: this.isLogin ? '登录成功' : '注册成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          this.redirectToHome();
        }, 1500);
        
      } catch (error) {
        console.error('认证失败:', error);
        uni.showToast({
          title: error.error || (this.isLogin ? '登录失败' : '注册失败'),
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.loading = false;
      }
    },
    
    redirectToHome() {
      uni.reLaunch({
        url: '/pages/index/index'
      });
    }
  }
};
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.header {
  padding: 100rpx 40rpx 60rpx;
  text-align: center;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #e2e8f0;
}

.form-container {
  background: #ffffff;
  margin: 40rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.tab-bar {
  display: flex;
  background: #f7fafc;
}

.tab-item {
  flex: 1;
  padding: 30rpx;
  text-align: center;
  font-size: 32rpx;
  color: #718096;
  background: #f7fafc;
  
  &.active {
    color: #667eea;
    background: #ffffff;
    font-weight: bold;
  }
}

.form {
  padding: 40rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 20rpx;
  background: #f7fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #333;
  box-sizing: border-box;
  
  &:focus {
    border-color: #667eea;
    background: #ffffff;
  }
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #667eea;
  color: #ffffff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
  
  &:disabled {
    background: #cbd5e0;
    color: #a0aec0;
  }
  
  &:not(:disabled):active {
    background: #5a67d8;
  }
}
</style>