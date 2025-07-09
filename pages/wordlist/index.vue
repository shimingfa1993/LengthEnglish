<template>
	<view class="container">
		<view class="header">
			<text class="title">{{ length }}字母单词</text>
			<text class="subtitle">
				共找到 {{ allWords.length }} 个单词
				<text v-if="!showAllWords && hasMore">（显示前 {{ displayWords.length }} 个）</text>
			</text>
			<view class="priority-notice">
				<text class="notice-text">💡 常用单词已优先显示</text>
			</view>
			
			<!-- 显示全部按钮 -->
			<view v-if="!showAllWords && allWords.length > displayWords.length" class="show-all-btn" @click="showAllWordsMethod">
				<text class="btn-text">显示全部 {{ allWords.length }} 个单词</text>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading && displayWords.length === 0" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载单词...</text>
		</view>
		
		<!-- 错误状态 -->
		<view v-else-if="error && displayWords.length === 0" class="error-container">
			<text class="error-text">{{ error }}</text>
			<button class="retry-btn" @click="loadWords">重试</button>
		</view>
		
		<!-- 单词列表 -->
		<scroll-view 
			v-else
			class="word-list" 
			scroll-y="true"
			@scrolltolower="loadMore"
			refresher-enabled
			@refresherrefresh="onRefresh"
			:refresher-triggered="refreshing"
		>
			<view class="list-container">
				<view 
					class="word-item" 
					v-for="(word, index) in displayWords" 
					:key="index"
					@click="goToWordDetail(word)"
				>
					<view class="word-content">
						<view class="word-info">
							<text class="word-text">{{ word }}</text>
							<view v-if="isWordCommon(word)" class="common-badge">
								<text class="badge-text">常用</text>
							</view>
						</view>
						<text class="word-number">{{ index + 1 }}</text>
					</view>
					<view class="arrow">›</view>
				</view>
				
				<!-- 加载更多状态 -->
				<view v-if="loading && displayWords.length > 0" class="load-more">
					<view class="loading-spinner small"></view>
					<text class="load-more-text">加载更多...</text>
				</view>
				
				<!-- 无更多数据 -->
				<view v-if="!hasMore && displayWords.length > 0" class="no-more">
					<text class="no-more-text">已显示全部 {{ allWords.length }} 个单词</text>
				</view>
				
				<!-- 分页提示 -->
				<view v-if="hasMore && !showAllWords && displayWords.length > 0" class="load-tip">
					<text class="tip-text">滚动到底部加载更多，或点击上方"显示全部"按钮</text>
				</view>
				
				<!-- 空状态 -->
				<view v-if="!loading && !error && displayWords.length === 0" class="empty-state">
					<text class="empty-text">暂无{{ length }}字母的单词</text>
					<text class="empty-subtitle">请返回选择其他长度</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { sortWordsByCommonness, getCommonWords, isCommonWord } from '@/utils/commonWords.js';

	export default {
		data() {
			return {
				length: 0,
				wordList: [],
				allWords: [], // 存储所有单词
				displayWords: [], // 当前显示的单词
				loading: false,
				refreshing: false,
				error: '',
				hasMore: true,
				currentPage: 1,
				pageSize: 100, // 前端分页大小
				showAllWords: false // 是否显示所有单词
			}
		},
		onLoad(options) {
			this.length = parseInt(options.length) || 1;
			this.loadWords();
		},
		onPullDownRefresh() {
			this.onRefresh();
		},
		methods: {
			// 生成搜索模式（根据长度生成对应数量的问号）
			generateSearchPattern() {
				return '?'.repeat(this.length);
			},
			
			// 加载单词数据
			async loadWords(isRefresh = false) {
				if (this.loading) return;
				
				this.loading = true;
				this.error = '';
				
				if (isRefresh) {
					this.currentPage = 1;
					this.hasMore = true;
					this.allWords = [];
					this.displayWords = [];
				}
				
				// 如果已经有所有单词数据，直接进行前端分页
				if (this.allWords.length > 0 && !isRefresh) {
					this.loadMoreFromCache();
					this.loading = false;
					return;
				}
				
				try {
					const pattern = this.generateSearchPattern();
					
					// 获取所有单词，不设置max限制，或设置一个很大的值
					const response = await uni.request({
						url: 'https://api.datamuse.com/words',
						method: 'GET',
						data: {
							sp: pattern,
							max: 10000 // 设置一个较大的值以获取更多单词
						}
					});
					
					if (response.statusCode === 200) {
						// 获取原始单词列表
						const originalWords = response.data.map(item => item.word);
						
						// 使用常用单词库重新排序，常用单词排在前面
						this.allWords = this.sortWordsByImportance(originalWords);
						
						// 重置分页
						this.currentPage = 1;
						this.displayWords = [];
						
						// 根据单词数量决定显示策略
						if (this.allWords.length <= 500) {
							// 单词不多，直接显示所有
							this.displayWords = [...this.allWords];
							this.showAllWords = true;
							this.hasMore = false;
						} else {
							// 单词很多，使用分页显示
							this.loadMoreFromCache();
							this.showAllWords = false;
						}
						
						if (this.allWords.length === 0) {
							this.error = '未找到符合条件的单词';
						} else {
							// 显示成功提示
							uni.showToast({
								title: `已加载${this.allWords.length}个单词`,
								icon: 'success',
								duration: 2000
							});
						}
					} else {
						throw new Error('网络请求失败');
					}
				} catch (err) {
					console.error('加载单词失败:', err);
					this.error = '加载失败，请检查网络连接';
					
					// 显示错误提示
					uni.showToast({
						title: '加载失败',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.loading = false;
					this.refreshing = false;
					
					// 结束下拉刷新
					if (isRefresh) {
						uni.stopPullDownRefresh();
					}
				}
			},
			
			// 从缓存中加载更多数据（前端分页）
			loadMoreFromCache() {
				const startIndex = (this.currentPage - 1) * this.pageSize;
				const endIndex = this.currentPage * this.pageSize;
				const newWords = this.allWords.slice(startIndex, endIndex);
				
				if (newWords.length > 0) {
					this.displayWords = [...this.displayWords, ...newWords];
					this.currentPage++;
				}
				
				// 检查是否还有更多数据
				this.hasMore = endIndex < this.allWords.length;
			},
			
			// 下拉刷新
			onRefresh() {
				this.refreshing = true;
				this.loadWords(true);
			},
			
			// 加载更多
			loadMore() {
				if (!this.hasMore || this.loading || this.showAllWords) return;
				
				// 如果已经有所有数据，直接从缓存加载
				if (this.allWords.length > 0) {
					this.loadMoreFromCache();
				} else {
					this.loadWords();
				}
			},
			
			// 显示所有单词
			showAllWordsMethod() {
				this.displayWords = [...this.allWords];
				this.showAllWords = true;
				this.hasMore = false;
				
				uni.showToast({
					title: `已显示全部${this.allWords.length}个单词`,
					icon: 'success',
					duration: 2000
				});
			},
			
			// 按重要性排序单词（常用单词优先）
			sortWordsByImportance(words) {
				// 使用常用单词库排序
				const sortedWords = sortWordsByCommonness(words, this.length);
				
				// 统计常用单词数量
				const commonWords = getCommonWords(this.length);
				const commonCount = words.filter(word => 
					commonWords.map(w => w.toLowerCase()).includes(word.toLowerCase())
				).length;
				
				if (commonCount > 0) {
					console.log(`${this.length}字母单词中找到${commonCount}个常用单词，已优先显示`);
				}
				
				return sortedWords;
			},
			
			// 检查单词是否为常用单词
			isWordCommon(word) {
				return isCommonWord(word, this.length);
			},
			
			// 跳转到单词详情页
			goToWordDetail(word) {
				uni.navigateTo({
					url: `/pages/worddetail/index?word=${encodeURIComponent(word)}`
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
		padding: 40rpx 40rpx 30rpx;
		text-align: center;
		background: #5a67d8;
	}
	
	.title {
		display: block;
		font-size: 44rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 16rpx;
	}
	
	.subtitle {
		display: block;
		font-size: 26rpx;
		color: #e2e8f0;
		margin-bottom: 20rpx;
	}
	
	.show-all-btn {
		background: rgba(255, 255, 255, 0.2);
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 20rpx;
		padding: 16rpx 32rpx;
		margin-top: 20rpx;
	}
	
	.show-all-btn:active {
		background: rgba(255, 255, 255, 0.3);
	}
	
	.btn-text {
		font-size: 26rpx;
		color: #ffffff;
	}
	
	.priority-notice {
		background: rgba(255, 255, 255, 0.15);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 16rpx;
		padding: 12rpx 20rpx;
		margin-top: 16rpx;
		text-align: center;
	}
	
	.notice-text {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.9);
		font-weight: 500;
	}
	
	.word-list {
		background: #f7fafc;
		min-height: 600rpx;
	}
	
	.list-container {
		padding: 30rpx 30rpx 40rpx;
	}
	
	.word-item {
		background: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 16rpx;
		padding: 28rpx 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		border: 2rpx solid #e2e8f0;
		transition: all 0.2s ease;
	}
	
	.word-item:active {
		background: #f7fafc;
		border-color: #667eea;
		transform: translateY(2rpx);
	}
	
	.word-item:last-child {
		margin-bottom: 0;
	}
	
	.word-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex: 1;
		margin-right: 20rpx;
	}
	
	.word-info {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 16rpx;
	}
	
	.word-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #2d3748;
		text-transform: lowercase;
	}
	
	.common-badge {
		background: linear-gradient(135deg, #ff6b6b, #ffa726);
		border-radius: 12rpx;
		padding: 4rpx 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
	}
	
	.badge-text {
		font-size: 20rpx;
		font-weight: bold;
		color: #ffffff;
		text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
	}
	
	.word-number {
		font-size: 24rpx;
		color: #a0aec0;
		background: #edf2f7;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
		min-width: 40rpx;
		text-align: center;
	}
	
	.arrow {
		font-size: 32rpx;
		color: #a0aec0;
		font-weight: bold;
	}
	
	/* 加载状态 */
	.loading-container, .error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 40rpx;
		background: #f7fafc;
		min-height: 600rpx;
	}
	
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 6rpx solid #e2e8f0;
		border-top: 6rpx solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20rpx;
	}
	
	.loading-spinner.small {
		width: 40rpx;
		height: 40rpx;
		border-width: 4rpx;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #4a5568;
	}
	
	.error-text {
		font-size: 28rpx;
		color: #e53e3e;
		margin-bottom: 30rpx;
		text-align: center;
	}
	
	.retry-btn {
		background: #667eea;
		color: white;
		border: none;
		border-radius: 12rpx;
		padding: 20rpx 40rpx;
		font-size: 28rpx;
	}
	
	.retry-btn:active {
		background: #5a67d8;
	}
	
	/* 加载更多 */
	.load-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;
	}
	
	.load-more-text {
		font-size: 26rpx;
		color: #4a5568;
		margin-left: 16rpx;
	}
	
	.no-more {
		text-align: center;
		padding: 40rpx 0;
	}
	
	.no-more-text {
		font-size: 26rpx;
		color: #a0aec0;
	}
	
	/* 分页提示 */
	.load-tip {
		text-align: center;
		padding: 30rpx 0;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 16rpx;
		margin-top: 20rpx;
	}
	
	.tip-text {
		font-size: 24rpx;
		color: #4a5568;
		line-height: 1.4;
	}
	
	/* 空状态 */
	.empty-state {
		text-align: center;
		padding: 100rpx 40rpx;
		background: #ffffff;
		border-radius: 20rpx;
		margin-top: 60rpx;
		border: 2rpx solid #e2e8f0;
	}
	
	.empty-text {
		display: block;
		font-size: 32rpx;
		color: #4a5568;
		margin-bottom: 16rpx;
	}
	
	.empty-subtitle {
		display: block;
		font-size: 26rpx;
		color: #718096;
	}
</style> 