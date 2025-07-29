<template>
	<view class="container">
		<view class="header">
			<view class="header-top">
				<text class="title">英语单词学习</text>
				<button class="logout-btn" @click="logout">退出</button>
			</view>
			<text class="subtitle">选择单词长度开始学习，或使用百度翻译</text>
		</view>
		
		<!-- 学习进度仪表板 -->
		<view class="learning-dashboard">
			<view class="dashboard-title">
				<text class="title-text">📊 学习进度</text>
			</view>
			
			<view class="progress-cards">
				<view class="progress-card today">
					<view class="card-header">
						<text class="card-title">今日学习</text>
						<text class="card-count">{{ learningStats.todayLearned }}/{{ learningStats.todayTarget }}</text>
					</view>
					<progress :percent="learningStats.todayProgress" stroke-width="8" activeColor="#007AFF"/>
				</view>
				
				<view class="progress-card streak">
					<text class="card-title">连续学习</text>
					<text class="streak-count">{{ learningStats.learningStreak }}</text>
					<text class="streak-unit">天</text>
				</view>
				
				<view class="progress-card total">
					<text class="card-title">总词汇量</text>
					<text class="total-count">{{ learningStats.totalWords }}</text>
					<text class="total-unit">个</text>
				</view>
			</view>
			
			<!-- 快速学习按钮 -->
			<view class="quick-actions">
				<button class="quick-btn flashcard" @click="startFlashcard">
					<text class="btn-icon">🎴</text>
					<text class="btn-text">闪卡学习</text>
				</button>
				<button class="quick-btn review" @click="startReview" :disabled="learningStats.reviewCount === 0">
					<text class="btn-icon">🔄</text>
					<text class="btn-text">复习 ({{ learningStats.reviewCount }})</text>
				</button>
			</view>
		</view>

		<!-- 快速翻译功能 -->
		<view class="translate-section">
			<view class="section-title">
				<text class="title-text">🚀 快速翻译</text>
				<text class="subtitle-text">输入英文或中文，立即翻译</text>
			</view>
			
			<view class="translate-container">
				<textarea 
					class="translate-input" 
					v-model="translateText" 
					placeholder="请输入要翻译的文本..." 
					maxlength="500"
					:disabled="translating">
				</textarea>
				
				<view class="translate-actions">
					<button 
						class="translate-btn" 
						:class="{ 'translating': translating }"
						@click="quickTranslate"
						:disabled="!translateText || translating">
						<text v-if="translating">翻译中...</text>
						<text v-else>翻译</text>
					</button>
					<button class="clear-btn" @click="clearTranslate">清空</button>
				</view>
				
				<view v-if="translateResult" class="translate-result">
					<view class="result-label">翻译结果：</view>
					<text class="result-text">{{ translateResult }}</text>
				</view>
			</view>
			
			<view class="more-translate">
				<text class="more-text" @click="goToTranslatePage">更多翻译功能 ›</text>
			</view>
		</view>

		<!-- 网络测试区域 -->
		<view class="network-test-section">
			<view class="section-title">
				<text class="title-text">🔧 网络诊断</text>
				<text class="subtitle-text">测试API连接状态</text>
			</view>
			
			<view class="test-container">
				<button 
					class="test-btn primary-btn" 
					@click="testNetworkConnection"
					:disabled="testing">
					<text v-if="testing">测试中...</text>
					<text v-else>测试网络连接</text>
				</button>
				
				<view v-if="testResults.length > 0" class="test-results">
					<view class="result-item" v-for="(result, index) in testResults" :key="index">
						<view class="result-header">
							<text class="api-name">{{ result.name }}</text>
							<view class="status-badge" :class="result.success ? 'success' : 'error'">
								<text>{{ result.success ? '✅ 成功' : '❌ 失败' }}</text>
							</view>
						</view>
						<text class="result-detail">{{ result.message }}</text>
						<text v-if="result.responseTime" class="response-time">
							响应时间: {{ result.responseTime }}ms
						</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 移除整个词性筛选面板 -->
		<!-- 原来的词性筛选面板代码已删除 -->
		
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
	import localWordsData from '@/utils/localWordsData.js';
	import * as LearningProgress from '@/utils/learningProgress.js';
	import { api } from '@/utils/api.js';

	export default {
		data() {
			return {
				wordLengthList: [],
				translateText: '',
				translateResult: '',
				translating: false,
				testing: false,
				testResults: [],
				learningStats: {
					totalWords: 0,
					todayLearned: 0,
					todayTarget: 10,
					todayProgress: 0,
					learningStreak: 0,
					reviewCount: 0
				},
				isLoggedIn: false,
				loading: false
			};
		},
		onLoad() {
			this.checkLoginStatus();
			this.initWordLengthList();
		},
		onShow() {
			this.checkLoginStatus();
			if (this.isLoggedIn) {
				this.loadLearningStats();
			}
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				const token = uni.getStorageSync('token');
				this.isLoggedIn = !!token;
				
				if (!this.isLoggedIn) {
					// 未登录，跳转到登录页
					uni.reLaunch({
						url: '/pages/login/index'
					});
					return;
				}
				
				// 已登录，加载学习统计
				this.loadLearningStats();
			},
			
			// 加载学习统计（从后端API）
			async loadLearningStats() {
				if (!this.isLoggedIn) return;
				
				this.loading = true;
				
				try {
					// 从后端获取学习统计
					const stats = await api.getLearningStats();
					
					this.learningStats = {
						totalWords: stats.totalWords || 0,
						todayLearned: stats.todayLearned || 0,
						todayTarget: stats.dailyTarget || 10,
						todayProgress: stats.dailyTarget ? Math.round((stats.todayLearned / stats.dailyTarget) * 100) : 0,
						learningStreak: stats.learningStreak || 0,
						reviewCount: stats.reviewCount || 0
					};
					
				} catch (error) {
					console.error('获取学习统计失败:', error);
					
					// 如果是认证错误，跳转到登录页
					if (error.statusCode === 401) {
						uni.removeStorageSync('token');
						uni.removeStorageSync('userId');
						uni.reLaunch({
							url: '/pages/login/index'
						});
						return;
					}
					
					// 其他错误，使用本地数据作为备用
					this.learningStats = LearningProgress.getLearningStats();
					
					uni.showToast({
						title: '获取学习数据失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},
			
			// 记录学习进度到后端
			async recordLearning(wordData) {
				if (!this.isLoggedIn) return;
				
				try {
					await api.recordLearning({
						word: wordData.word,
						difficulty: wordData.difficulty || 'normal',
						correct: wordData.correct || true
					});
					
					// 记录成功后刷新统计
					this.loadLearningStats();
					
				} catch (error) {
					console.error('记录学习进度失败:', error);
					// 静默失败，不影响用户体验
				}
			},
			
			// 退出登录
			logout() {
				uni.showModal({
					title: '确认退出',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							uni.removeStorageSync('token');
							uni.removeStorageSync('userId');
							uni.reLaunch({
								url: '/pages/login/index'
							});
						}
					}
				});
			},
			
			// 初始化单词长度列表
			initWordLengthList() {
				this.wordLengthList = [];
				for (let i = 1; i <= 20; i++) {
					this.wordLengthList.push({
						length: i
					});
				}
			},
			
			// 开始闪卡学习
			startFlashcard() {
				uni.navigateTo({
					url: '/pages/flashcard/index'
				});
			},
			
			// 开始复习
			startReview() {
				if (this.learningStats.reviewCount === 0) {
					uni.showToast({
						title: '今日无需复习',
						icon: 'none'
					});
					return;
				}
				
				uni.navigateTo({
					url: '/pages/flashcard/index?mode=review'
				});
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
			
			// 简化：直接跳转到单词列表页面
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
			},
			
			// 清空翻译
			clearTranslate() {
				this.translateText = '';
				this.translateResult = '';
			},
			
			// 测试网络连接
			async testNetworkConnection() {
				if (this.testing) return;
				
				this.testing = true;
				this.testResults = [];
				
				uni.showLoading({
					title: '测试网络连接...'
				});
				
				const apis = [
					{
						name: '百度翻译API',
						url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
						testMethod: 'POST',
						timeout: 8000,
						testData: {
							q: 'hello',
							from: 'en',
							to: 'zh',
							appid: 'test',
							salt: Date.now().toString(),
							sign: 'test'
						}
					},
					{
						name: '英语单词API (Datamuse)',
						url: 'https://api.datamuse.com/words',
						testMethod: 'GET',
						timeout: 10000,
						testData: {
							sp: 'test',
							max: 1
						}
					},
					{
						name: '英语词典API (DictionaryAPI)',
						url: 'https://api.dictionaryapi.dev/api/v2/entries/en/test',
						testMethod: 'GET',
						timeout: 15000,
						testData: null
					}
				];
				
				for (const api of apis) {
					const startTime = Date.now();
					try {
						console.log(`测试API: ${api.name}`);
						
						const requestConfig = {
							url: api.url,
							method: api.testMethod,
							timeout: api.timeout,
							header: {
								'Content-Type': api.testMethod === 'POST' 
									? 'application/x-www-form-urlencoded' 
									: 'application/json'
							}
						};
						
						if (api.testData) {
							requestConfig.data = api.testData;
						}
						
						const response = await uni.request(requestConfig);
						const responseTime = Date.now() - startTime;
						
						if (response.statusCode >= 200 && response.statusCode < 400) {
							this.testResults.push({
								name: api.name,
								success: true,
								message: `连接成功 (状态码: ${response.statusCode})`,
								responseTime: responseTime
							});
						} else {
							this.testResults.push({
								name: api.name,
								success: false,
								message: `连接失败，状态码: ${response.statusCode}`,
								responseTime: responseTime
							});
						}
					} catch (error) {
						const responseTime = Date.now() - startTime;
						console.error(`${api.name} 测试失败:`, error);
						
						let errorMessage = '连接失败';
						if (error.errMsg) {
							if (error.errMsg.includes('request:fail')) {
								if (api.name.includes('DictionaryAPI')) {
									errorMessage = '网络请求失败，该API在中国大陆访问较慢，可尝试使用其他网络环境';
								} else {
									errorMessage = '网络请求失败，可能是域名未配置或网络问题';
								}
							} else if (error.errMsg.includes('timeout')) {
								if (api.name.includes('DictionaryAPI')) {
									errorMessage = `请求超时(${Math.round(responseTime/1000)}秒)，海外API响应较慢属正常现象`;
								} else {
									errorMessage = '请求超时，网络较慢或服务器无响应';
								}
							} else if (error.errMsg.includes('abort')) {
								errorMessage = '请求被中止';
							} else {
								errorMessage = `错误: ${error.errMsg}`;
							}
						}
						
						this.testResults.push({
							name: api.name,
							success: false,
							message: errorMessage,
							responseTime: responseTime > 100 ? responseTime : null
						});
					}
				}
				
				uni.hideLoading();
				this.testing = false;
				
				// 显示测试结果摘要
				const successCount = this.testResults.filter(r => r.success).length;
				const totalCount = this.testResults.length;
				
				uni.showToast({
					title: `测试完成: ${successCount}/${totalCount} 个API可用`,
					icon: successCount === totalCount ? 'success' : 'none',
					duration: 3000
				});
				
				// 特殊提示：如果只有DictionaryAPI失败
				const onlyDictFailed = successCount === 2 && this.testResults.find(r => r.name.includes('DictionaryAPI') && !r.success);
				if (onlyDictFailed) {
					setTimeout(() => {
						uni.showModal({
							title: '网络诊断结果',
							content: 'DictionaryAPI访问较慢属正常现象，主要功能API(百度翻译、单词查询)均正常，您的应用可以正常使用！',
							showCancel: false,
							confirmText: '知道了'
						});
					}, 3500);
				} else if (successCount === 0) {
					setTimeout(() => {
						uni.showModal({
							title: '网络诊断',
							content: '所有API均无法访问。请检查：\n1. 手机网络连接\n2. 微信小程序域名配置\n3. 防火墙设置',
							showCancel: false
						});
					}, 3500);
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		min-height: 100vh;
		background: #667eea;
		padding: 0;
	}
	
	.header {
		padding: 60rpx 40rpx 40rpx;
		background: #5a67d8;
	}
	
	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.title {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.logout-btn {
		background: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 20rpx;
		padding: 10rpx 20rpx;
		font-size: 24rpx;
	}
	
	.logout-btn:active {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(0.95);
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
	
	.section-title {
		margin-bottom: 25rpx;
	}
	
	.title-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #667eea;
		display: block;
	}
	
	.subtitle-text {
		font-size: 24rpx;
		color: #718096;
		margin-top: 5rpx;
		display: block;
	}
	
	.translate-container {
		margin-bottom: 20rpx;
	}
	
	.translate-input {
		width: 100%;
		min-height: 120rpx;
		padding: 20rpx;
		background: #f7fafc;
		border: 2rpx solid #e2e8f0;
		border-radius: 15rpx;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 20rpx;
		box-sizing: border-box;
	}
	
	.translate-input:focus {
		border-color: #667eea;
		background: #ffffff;
	}
	
	.translate-actions {
		display: flex;
		gap: 15rpx;
		margin-bottom: 20rpx;
	}
	
	.translate-btn {
		flex: 2;
		padding: 20rpx;
		background: #667eea;
		color: white;
		border-radius: 15rpx;
		font-size: 28rpx;
		font-weight: bold;
		border: none;
		transition: all 0.3s ease;
	}
	
	.translate-btn.translating {
		background: #cbd5e0;
		color: #a0aec0;
	}
	
	.translate-btn:disabled {
		background: #cbd5e0;
		color: #a0aec0;
	}
	
	.clear-btn {
		flex: 1;
		padding: 20rpx;
		background: #e2e8f0;
		color: #4a5568;
		border-radius: 15rpx;
		font-size: 26rpx;
		border: none;
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
	
	.more-translate {
		text-align: center;
	}
	
	.more-text {
		font-size: 26rpx;
		color: #667eea;
		text-decoration: underline;
	}
	
	/* 网络测试样式 */
	.network-test-section {
		background: #ffffff;
		margin: 30rpx;
		border-radius: 24rpx;
		padding: 32rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
		border-left: 6rpx solid #fa709a;
	}
	
	.test-container {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	
	.test-btn {
		padding: 20rpx;
		background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
		color: white;
		border-radius: 15rpx;
		font-size: 28rpx;
		font-weight: bold;
		border: none;
		transition: all 0.3s ease;
	}
	
	.test-btn:disabled {
		background: #cbd5e0;
		color: #a0aec0;
	}
	
	.test-results {
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}
	
	.result-item {
		padding: 20rpx;
		background: #f7fafc;
		border-radius: 12rpx;
		border-left: 4rpx solid #4facfe;
	}
	
	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.api-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}
	
	.status-badge {
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
	}
	
	.status-badge.success {
		background: #e8f5e8;
		color: #4caf50;
	}
	
	.status-badge.error {
		background: #ffebee;
		color: #f44336;
	}
	
	.result-detail {
		font-size: 24rpx;
		color: #666;
		line-height: 1.4;
		margin-bottom: 8rpx;
	}
	
	.response-time {
		font-size: 22rpx;
		color: #999;
	}
	
	/* 词性筛选面板样式 */
	.pos-filter-panel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60rpx;
	}
	
	.filter-content {
		background: white;
		border-radius: 24rpx;
		max-width: 600rpx;
		width: 100%;
		max-height: 80vh;
		overflow: hidden;
	}
	
	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx;
		background: #667eea;
		color: white;
		border-radius: 24rpx 24rpx 0 0;
	}
	
	.filter-title {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: none;
		border-radius: 50%;
		width: 60rpx;
		height: 60rpx;
		font-size: 36rpx;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.pos-grid {
		padding: 32rpx;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		max-height: 50vh;
		overflow-y: auto;
	}
	
	.pos-item {
		background: #f7fafc;
		border: 2rpx solid #e2e8f0;
		border-radius: 16rpx;
		padding: 24rpx;
		text-align: center;
		transition: all 0.3s ease;
		cursor: pointer;
	}
	
	.pos-item:active {
		background: #e6efff;
		border-color: #667eea;
		transform: scale(0.98);
	}
	
	.pos-item.all-pos {
		background: #667eea;
		color: white;
		border-color: #667eea;
	}
	
	.pos-name {
		display: block;
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 8rpx;
	}
	
	.pos-count {
		display: block;
		font-size: 22rpx;
		color: #666;
	}
	
	.all-pos .pos-count {
		color: rgba(255, 255, 255, 0.8);
	}
	
	/* 单词列表样式 */
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
		transition: all 0.3s ease;
	}
	
	.word-item:active {
		background: #f7fafc;
		border-color: #667eea;
		transform: translateY(-2rpx);
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

	.learning-dashboard {
		margin: 30rpx 0;
		padding: 30rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 20rpx;
		color: white;
		
		.dashboard-title {
			margin-bottom: 30rpx;
			
			.title-text {
				font-size: 32rpx;
				font-weight: bold;
			}
		}
		
		.progress-cards {
			display: flex;
			justify-content: space-between;
			margin-bottom: 30rpx;
			
			.progress-card {
				flex: 1;
				background: rgba(255, 255, 255, 0.2);
				border-radius: 15rpx;
				padding: 25rpx;
				margin: 0 10rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				
				&.today {
					.card-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						width: 100%;
						margin-bottom: 15rpx;
						
						.card-title {
							font-size: 24rpx;
						}
						
						.card-count {
							font-size: 28rpx;
							font-weight: bold;
						}
					}
				}
				
				.card-title {
					font-size: 24rpx;
					margin-bottom: 10rpx;
					opacity: 0.8;
				}
				
				.streak-count, .total-count {
					font-size: 36rpx;
					font-weight: bold;
					margin-bottom: 5rpx;
				}
				
				.streak-unit, .total-unit {
					font-size: 20rpx;
					opacity: 0.8;
				}
			}
		}
		
		.quick-actions {
			display: flex;
			gap: 20rpx;
			
			.quick-btn {
				flex: 1;
				background: rgba(255, 255, 255, 0.9);
				color: #333;
				border: none;
				border-radius: 15rpx;
				padding: 25rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				transition: transform 0.2s;
				
				&:active {
					transform: scale(0.95);
				}
				
				&:disabled {
					opacity: 0.5;
				}
				
				.btn-icon {
					font-size: 32rpx;
					margin-bottom: 10rpx;
				}
				
				.btn-text {
					font-size: 24rpx;
					font-weight: bold;
				}
			}
		}
	}
</style>