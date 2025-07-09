<template>
	<view class="container">
		<!-- 翻译主界面 -->
		<view class="translate-main">
			<!-- 语言选择 -->
			<view class="language-selector">
				<view class="language-item">
					<picker 
						:value="fromLangIndex" 
						:range="fromLanguages" 
						range-key="name"
						@change="onFromLanguageChange"
					>
						<view class="language-text">
							{{ fromLanguages[fromLangIndex].name }}
						</view>
					</picker>
				</view>
				
				<view class="swap-btn" @click="swapLanguages">
					<text class="swap-icon">⇄</text>
				</view>
				
				<view class="language-item">
					<picker 
						:value="toLangIndex" 
						:range="toLanguages" 
						range-key="name"
						@change="onToLanguageChange"
					>
						<view class="language-text">
							{{ toLanguages[toLangIndex].name }}
						</view>
					</picker>
				</view>
			</view>
			
			<!-- 输入区域 -->
			<view class="input-section">
				<textarea 
					v-model="inputText"
					placeholder="请输入要翻译的文本..."
					class="input-textarea"
					:maxlength="5000"
					auto-height
				></textarea>
				<view class="input-actions">
					<view class="char-count">{{ inputText.length }}/5000</view>
					<view class="action-buttons">
						<button 
							class="clear-btn" 
							@click="clearInput"
							v-if="inputText"
						>
							清空
						</button>
						<button 
							class="paste-btn" 
							@click="pasteText"
						>
							粘贴
						</button>
					</view>
				</view>
			</view>
			
			<!-- 翻译按钮 -->
			<view class="translate-button-section">
				<button 
					class="translate-btn"
					@click="translateText"
					:disabled="!inputText.trim() || translating"
				>
					{{ translating ? '翻译中...' : '翻译' }}
				</button>
			</view>
			
			<!-- 结果区域 -->
			<view class="result-section" v-if="translateResult || translating">
				<view class="result-header">
					<text class="result-title">翻译结果</text>
					<view class="result-actions" v-if="translateResult">
						<button class="copy-btn" @click="copyResult">
							复制
						</button>
						<button class="speak-btn" @click="speakResult">
							🔊
						</button>
					</view>
				</view>
				
				<view class="result-content">
					<view v-if="translating" class="loading">
						<view class="loading-spinner"></view>
						<text class="loading-text">正在翻译...</text>
					</view>
					<view v-else class="result-text">
						{{ translateResult }}
					</view>
				</view>
			</view>
		</view>
		
		<!-- 翻译历史 -->
		<view class="history-section" v-if="translateHistory.length > 0">
			<view class="history-header">
				<text class="history-title">翻译历史</text>
				<button class="clear-history-btn" @click="clearHistory">
					清空历史
				</button>
			</view>
			
			<scroll-view class="history-list" scroll-y="true">
				<view 
					v-for="(item, index) in translateHistory" 
					:key="index"
					class="history-item"
					@click="useHistoryItem(item)"
				>
					<view class="history-content">
						<text class="history-original">{{ item.original }}</text>
						<text class="history-translated">{{ item.translated }}</text>
					</view>
					<view class="history-meta">
						<text class="history-time">{{ formatTime(item.time) }}</text>
						<text class="history-lang">{{ item.fromLang }} → {{ item.toLang }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 功能说明 -->
		<view class="info-section">
			<text class="info-title">功能说明</text>
			<view class="info-list">
				<text class="info-item">• 支持中英文互译</text>
				<text class="info-item">• 自动保存翻译历史</text>
				<text class="info-item">• 支持复制和粘贴</text>
				<text class="info-item">• 基于百度翻译API</text>
			</view>
		</view>
	</view>
</template>

<script>
	import baiduTranslate from '@/utils/baiduTranslate.js';

	export default {
		data() {
			return {
				inputText: '',
				translateResult: '',
				translating: false,
				fromLangIndex: 0,
				toLangIndex: 0,
				fromLanguages: [
					{ code: 'en', name: '英语' },
					{ code: 'zh', name: '中文' },
					{ code: 'auto', name: '自动检测' }
				],
				toLanguages: [
					{ code: 'zh', name: '中文' },
					{ code: 'en', name: '英语' }
				],
				translateHistory: []
			}
		},
		onLoad() {
			this.loadHistory();
		},
		methods: {
			// 语言选择改变
			onFromLanguageChange(e) {
				this.fromLangIndex = e.detail.value;
			},
			
			onToLanguageChange(e) {
				this.toLangIndex = e.detail.value;
			},
			
			// 交换语言
			swapLanguages() {
				if (this.fromLanguages[this.fromLangIndex].code === 'auto') {
					uni.showToast({
						title: '自动检测不支持交换',
						icon: 'none',
						duration: 2000
					});
					return;
				}
				
				// 交换语言选择
				const tempFromIndex = this.fromLangIndex;
				const tempToIndex = this.toLangIndex;
				
				// 查找对应的语言在另一个数组中的位置
				const fromLang = this.fromLanguages[tempFromIndex];
				const toLang = this.toLanguages[tempToIndex];
				
				// 设置新的语言选择
				this.fromLangIndex = this.fromLanguages.findIndex(lang => lang.code === toLang.code);
				this.toLangIndex = this.toLanguages.findIndex(lang => lang.code === fromLang.code);
				
				// 如果找不到对应语言，使用默认值
				if (this.fromLangIndex === -1) this.fromLangIndex = 0;
				if (this.toLangIndex === -1) this.toLangIndex = 0;
				
				// 交换输入和输出文本
				const tempText = this.inputText;
				this.inputText = this.translateResult;
				this.translateResult = tempText;
			},
			
			// 翻译文本
			async translateText() {
				if (!this.inputText.trim() || this.translating) return;
				
				this.translating = true;
				this.translateResult = '';
				
				try {
					const fromLang = this.fromLanguages[this.fromLangIndex].code;
					const toLang = this.toLanguages[this.toLangIndex].code;
					
					const result = await baiduTranslate.translate(
						this.inputText.trim(), 
						fromLang, 
						toLang
					);
					
					if (result && result.trans_result && result.trans_result.length > 0) {
						this.translateResult = result.trans_result[0].dst;
						
						// 保存到历史记录
						this.saveToHistory({
							original: this.inputText.trim(),
							translated: this.translateResult,
							fromLang: this.fromLanguages[this.fromLangIndex].name,
							toLang: this.toLanguages[this.toLangIndex].name,
							time: Date.now()
						});
						
						uni.showToast({
							title: '翻译完成',
							icon: 'success',
							duration: 1500
						});
					} else {
						throw new Error('翻译结果为空');
					}
				} catch (error) {
					console.error('翻译失败:', error);
					this.translateResult = '翻译失败：' + (error.message || '网络错误，请检查您的网络连接');
					
					uni.showToast({
						title: '翻译失败',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.translating = false;
				}
			},
			
			// 清空输入
			clearInput() {
				this.inputText = '';
				this.translateResult = '';
			},
			
			// 粘贴文本
			async pasteText() {
				try {
					const clipboardData = await uni.getClipboardData();
					if (clipboardData.data) {
						this.inputText = clipboardData.data;
						uni.showToast({
							title: '粘贴成功',
							icon: 'success',
							duration: 1000
						});
					}
				} catch (error) {
					console.error('粘贴失败:', error);
					uni.showToast({
						title: '粘贴失败',
						icon: 'none',
						duration: 2000
					});
				}
			},
			
			// 复制结果
			async copyResult() {
				if (!this.translateResult) return;
				
				try {
					await uni.setClipboardData({
						data: this.translateResult
					});
					uni.showToast({
						title: '复制成功',
						icon: 'success',
						duration: 1000
					});
				} catch (error) {
					console.error('复制失败:', error);
					uni.showToast({
						title: '复制失败',
						icon: 'none',
						duration: 2000
					});
				}
			},
			
			// 朗读结果
			speakResult() {
				uni.showToast({
					title: '语音播放功能开发中',
					icon: 'none',
					duration: 2000
				});
			},
			
			// 保存到历史记录
			saveToHistory(item) {
				this.translateHistory.unshift(item);
				
				// 只保留最近50条记录
				if (this.translateHistory.length > 50) {
					this.translateHistory = this.translateHistory.slice(0, 50);
				}
				
				// 保存到本地存储
				try {
					uni.setStorageSync('translateHistory', this.translateHistory);
				} catch (error) {
					console.error('保存历史记录失败:', error);
				}
			},
			
			// 加载历史记录
			loadHistory() {
				try {
					const history = uni.getStorageSync('translateHistory');
					if (history && Array.isArray(history)) {
						this.translateHistory = history;
					}
				} catch (error) {
					console.error('加载历史记录失败:', error);
				}
			},
			
			// 清空历史记录
			clearHistory() {
				uni.showModal({
					title: '确认清空',
					content: '确定要清空翻译历史吗？',
					success: (res) => {
						if (res.confirm) {
							this.translateHistory = [];
							uni.removeStorageSync('translateHistory');
							uni.showToast({
								title: '历史记录已清空',
								icon: 'success',
								duration: 1500
							});
						}
					}
				});
			},
			
			// 使用历史记录项
			useHistoryItem(item) {
				this.inputText = item.original;
				this.translateResult = item.translated;
			},
			
			// 格式化时间
			formatTime(timestamp) {
				const date = new Date(timestamp);
				const now = new Date();
				const diff = now.getTime() - timestamp;
				
				if (diff < 60000) { // 1分钟内
					return '刚刚';
				} else if (diff < 3600000) { // 1小时内
					return Math.floor(diff / 60000) + '分钟前';
				} else if (diff < 86400000) { // 1天内
					return Math.floor(diff / 3600000) + '小时前';
				} else if (diff < 604800000) { // 1周内
					return Math.floor(diff / 86400000) + '天前';
				} else {
					return date.toLocaleDateString();
				}
			}
		}
	}
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background: #f7fafc;
		padding: 30rpx;
	}
	
	.translate-main {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}
	
	/* 语言选择器 */
	.language-selector {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 16rpx;
	}
	
	.language-item {
		flex: 1;
		text-align: center;
	}
	
	.language-text {
		color: #667eea;
		font-size: 28rpx;
		font-weight: bold;
		padding: 16rpx;
		border: 2rpx solid #e2e8f0;
		border-radius: 12rpx;
		background: #ffffff;
	}
	
	.swap-btn {
		margin: 0 20rpx;
		padding: 16rpx;
		background: #667eea;
		border-radius: 50%;
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.swap-icon {
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
	}
	
	/* 输入区域 */
	.input-section {
		margin-bottom: 30rpx;
	}
	
	.input-textarea {
		width: 100%;
		min-height: 200rpx;
		padding: 24rpx;
		border: 2rpx solid #e2e8f0;
		border-radius: 16rpx;
		font-size: 28rpx;
		color: #2d3748;
		background: #ffffff;
		line-height: 1.5;
	}
	
	.input-textarea:focus {
		border-color: #667eea;
	}
	
	.input-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 16rpx;
	}
	
	.char-count {
		color: #718096;
		font-size: 24rpx;
	}
	
	.action-buttons {
		display: flex;
		gap: 16rpx;
	}
	
	.clear-btn, .paste-btn {
		background: #e2e8f0;
		color: #4a5568;
		border: none;
		border-radius: 12rpx;
		padding: 12rpx 24rpx;
		font-size: 24rpx;
	}
	
	.clear-btn:active, .paste-btn:active {
		background: #cbd5e0;
	}
	
	/* 翻译按钮 */
	.translate-button-section {
		text-align: center;
		margin-bottom: 30rpx;
	}
	
	.translate-btn {
		background: #667eea;
		color: #ffffff;
		border: none;
		border-radius: 24rpx;
		padding: 20rpx 60rpx;
		font-size: 32rpx;
		font-weight: bold;
		min-width: 200rpx;
	}
	
	.translate-btn:disabled {
		background: #cbd5e0;
		color: #a0aec0;
	}
	
	/* 结果区域 */
	.result-section {
		border-top: 2rpx solid #e2e8f0;
		padding-top: 30rpx;
	}
	
	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.result-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #2d3748;
	}
	
	.result-actions {
		display: flex;
		gap: 16rpx;
	}
	
	.copy-btn, .speak-btn {
		background: #48bb78;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		padding: 12rpx 20rpx;
		font-size: 24rpx;
	}
	
	.result-content {
		background: #f0f4ff;
		border: 2rpx solid #e6efff;
		border-radius: 16rpx;
		padding: 24rpx;
		min-height: 120rpx;
	}
	
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
	}
	
	.loading-spinner {
		width: 40rpx;
		height: 40rpx;
		border: 4rpx solid #e2e8f0;
		border-top: 4rpx solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.loading-text {
		color: #718096;
		font-size: 26rpx;
	}
	
	.result-text {
		font-size: 30rpx;
		color: #2d3748;
		line-height: 1.6;
	}
	
	/* 历史记录 */
	.history-section {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}
	
	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}
	
	.history-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #2d3748;
	}
	
	.clear-history-btn {
		background: #fed7d7;
		color: #e53e3e;
		border: none;
		border-radius: 12rpx;
		padding: 12rpx 20rpx;
		font-size: 24rpx;
	}
	
	.history-list {
		max-height: 600rpx;
	}
	
	.history-item {
		border: 2rpx solid #e2e8f0;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		background: #f8f9fa;
	}
	
	.history-item:active {
		background: #e2e8f0;
	}
	
	.history-content {
		margin-bottom: 12rpx;
	}
	
	.history-original {
		display: block;
		font-size: 26rpx;
		color: #4a5568;
		margin-bottom: 8rpx;
	}
	
	.history-translated {
		display: block;
		font-size: 28rpx;
		color: #2d3748;
		font-weight: 500;
	}
	
	.history-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.history-time, .history-lang {
		font-size: 22rpx;
		color: #718096;
	}
	
	/* 功能说明 */
	.info-section {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}
	
	.info-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #2d3748;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.info-list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}
	
	.info-item {
		font-size: 26rpx;
		color: #4a5568;
		line-height: 1.5;
	}
</style> 