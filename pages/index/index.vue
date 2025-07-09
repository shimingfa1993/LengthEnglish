<template>
	<view class="container">
		<view class="header">
			<text class="title">英语单词学习</text>
			<text class="subtitle">选择单词长度开始学习，或使用百度翻译</text>
		</view>
		
		<!-- 快速翻译功能 -->
		<view class="translate-section">
			<view class="translate-header">
				<text class="translate-title">🔥 翻译助手</text>
			</view>
			<view class="translate-input-section">
				<input 
					class="translate-input" 
					v-model="translateText"
					placeholder="输入英文单词或句子进行翻译..."
					@confirm="quickTranslate"
				/>
				<button 
					class="translate-btn" 
					@click="quickTranslate"
					:disabled="!translateText || translating"
				>
					{{ translating ? '翻译中' : '翻译' }}
				</button>
			</view>
			<view v-if="translateResult" class="translate-result">
				<text class="result-label">翻译结果：</text>
				<text class="result-text">{{ translateResult }}</text>
			</view>
			<view class="translate-actions">
				<button class="action-btn" @click="goToTranslatePage">
					完整翻译功能
				</button>
			</view>
			<view class="translate-tips">
				<text class="tips-text">💡 支持单词、短语和句子翻译</text>
			</view>
		</view>
		
		<scroll-view class="word-list" scroll-y="true">
			<view class="list-container">
				<view 
					class="word-item" 
					v-for="item in wordLengthList" 
					:key="item.length"
					@click="goToWordList(item.length)"
				>
					<view class="item-content">
						<text class="length-number">{{ item.length }}</text>
						<text class="length-text">字母</text>
					</view>
					<view class="arrow">›</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import baiduTranslate from '@/utils/baiduTranslate.js';

	export default {
		data() {
			return {
				wordLengthList: [],
				translateText: '',
				translateResult: '',
				translating: false
			}
		},
		onLoad() {
			this.initWordLengthList();
		},
		methods: {
			// 初始化单词长度列表
			initWordLengthList() {
				this.wordLengthList = [];
				for (let i = 1; i <= 20; i++) {
					this.wordLengthList.push({
						length: i
					});
				}
			},
			
			// 快速翻译
			async quickTranslate() {
				if (!this.translateText || this.translating) return;
				
				this.translating = true;
				this.translateResult = '';
				
				try {
					const result = await baiduTranslate.translate(this.translateText.trim());
					if (result && result.trans_result && result.trans_result.length > 0) {
						this.translateResult = result.trans_result[0].dst;
					} else {
						this.translateResult = '翻译失败，请重试';
					}
				} catch (error) {
					console.error('翻译失败:', error);
					this.translateResult = '翻译失败：' + (error.message || '网络错误');
					
					uni.showToast({
						title: '翻译失败',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.translating = false;
				}
			},
			
			// 跳转到单词列表页
			goToWordList(length) {
				uni.navigateTo({
					url: `/pages/wordlist/index?length=${length}`
				});
			},
			
			// 跳转到完整翻译页面
			goToTranslatePage() {
				uni.navigateTo({
					url: '/pages/translate/index'
				});
			}
		}
	}
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background: #667eea;
		padding: 0;
	}
	
	.header {
		padding: 60rpx 40rpx 40rpx;
		text-align: center;
		background: #5a67d8;
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
	
	/* 翻译功能样式 */
	.translate-section {
		background: #ffffff;
		margin: 30rpx;
		border-radius: 24rpx;
		padding: 32rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
	}
	
	.translate-header {
		text-align: center;
		margin-bottom: 32rpx;
	}
	
	.translate-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #667eea;
	}
	
	.translate-input-section {
		display: flex;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}
	
	.translate-input {
		flex: 1;
		background: #f7fafc;
		border: 2rpx solid #e2e8f0;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		font-size: 28rpx;
		color: #2d3748;
	}
	
	.translate-input:focus {
		border-color: #667eea;
		background: #ffffff;
	}
	
	.translate-btn {
		background: #667eea;
		color: #ffffff;
		border: none;
		border-radius: 16rpx;
		padding: 20rpx 32rpx;
		font-size: 28rpx;
		font-weight: bold;
		min-width: 140rpx;
	}
	
	.translate-btn:disabled {
		background: #cbd5e0;
		color: #a0aec0;
	}
	
	.translate-result {
		background: #f0f4ff;
		border: 2rpx solid #e6efff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
	}
	
	.result-label {
		display: block;
		font-size: 24rpx;
		color: #718096;
		margin-bottom: 12rpx;
	}
	
	.result-text {
		display: block;
		font-size: 32rpx;
		color: #2d3748;
		line-height: 1.5;
		font-weight: 500;
	}
	
	.translate-actions {
		text-align: center;
	}
	
	.action-btn {
		background: #48bb78;
		color: #ffffff;
		border: none;
		border-radius: 24rpx;
		padding: 16rpx 40rpx;
		font-size: 26rpx;
		font-weight: bold;
	}
	
	.translate-tips {
		text-align: center;
		margin-top: 16rpx;
		padding: 12rpx;
		background: #f0f8ff;
		border-radius: 12rpx;
		border: 1rpx solid #e6f3ff;
	}
	
	.tips-text {
		font-size: 22rpx;
		color: #667eea;
		font-weight: 500;
	}
	
	.word-list {
		background: #f7fafc;
		min-height: 400rpx;
	}
	
	.list-container {
		padding: 40rpx 30rpx;
	}
	
	.word-item {
		background: #ffffff;
		border-radius: 24rpx;
		margin-bottom: 24rpx;
		padding: 32rpx 40rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		border: 2rpx solid #e2e8f0;
	}
	
	.word-item:active {
		background: #f7fafc;
		border-color: #667eea;
	}
	
	.word-item:last-child {
		margin-bottom: 40rpx;
	}
	
	.item-content {
		display: flex;
		align-items: baseline;
		flex: 1;
	}
	
	.length-number {
		font-size: 48rpx;
		font-weight: bold;
		color: #667eea;
		margin-right: 12rpx;
	}
	
	.length-text {
		font-size: 32rpx;
		color: #4a5568;
		font-weight: 500;
	}
	
	.arrow {
		font-size: 40rpx;
		color: #a0aec0;
		font-weight: bold;
	}
</style>
