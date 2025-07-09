<template>
	<view class="container">
		<view class="header">
			<text class="title">英语单词学习</text>
			<text class="subtitle">选择单词长度开始学习，或使用百度翻译</text>
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
				translating: false,
				testing: false,
				testResults: []
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
						timeout: 8000, // 8秒超时
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
						timeout: 10000, // 10秒超时
						testData: {
							sp: 'test',
							max: 1
						}
					},
					{
						name: '英语词典API (DictionaryAPI)',
						url: 'https://api.dictionaryapi.dev/api/v2/entries/en/test',
						testMethod: 'GET',
						timeout: 15000, // 15秒超时，海外API需要更长时间
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
							timeout: api.timeout, // 使用各API自定义的超时时间
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
						
						console.log(`${api.name} 响应:`, response);
						
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
	
	/* 新增样式 */
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
</style>
