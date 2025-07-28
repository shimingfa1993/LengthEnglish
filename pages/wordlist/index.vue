<template>
	<view class="container">
		// 在模板的header部分添加
		<view class="header">
			<text class="title">{{ length }}字母单词</text>
			<text class="subtitle">
				共找到 {{ filteredWords.length }} 个单词
				<text v-if="selectedPartOfSpeech !== 'all'">（{{ selectedPartOfSpeechName }}）</text>
				<text v-if="!showAllWords && hasMore">（显示前 {{ displayWords.length }} 个）</text>
			</text>
			
			<!-- 词性分类切换 -->
			<view class="pos-filter-container">
				<scroll-view class="pos-filter-scroll" scroll-x="true">
					<view class="pos-filter-list">
						<view 
							class="pos-filter-item" 
							:class="{ active: selectedPartOfSpeech === 'all' }"
							@click="selectPartOfSpeech('all', '全部')"
						>
							<text class="pos-filter-text">全部</text>
						</view>
						<view 
							v-for="pos in availablePartsOfSpeech" 
							:key="pos.key"
							class="pos-filter-item" 
							:class="{ active: selectedPartOfSpeech === pos.key }"
							@click="selectPartOfSpeech(pos.key, pos.name)"
						>
							<text class="pos-filter-text">{{ pos.name }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
			
			<!-- 移除整个 priority-notice 部分 -->
			<!-- 原来的常见单词提示已删除 -->
			
			<!-- 显示全部按钮 -->
			<view v-if="!showAllWords && filteredWords.length > displayWords.length" class="show-all-btn" @click="showAllWordsMethod">
				<text class="btn-text">显示全部{{ selectedPartOfSpeech === 'all' ? '' : selectedPartOfSpeechName }}{{ filteredWords.length }}个单词</text>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading && displayWords.length === 0" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载单词...</text>
		</view>
		
		<!-- 错误状态 - 移除重试按钮 -->
		<view v-else-if="error && displayWords.length === 0" class="error-container">
			<text class="error-text">{{ error }}</text>
			<text class="error-subtitle">请返回重新选择或检查网络连接</text>
		</view>
		
		<!-- 单词列表 -->
		<scroll-view 
			v-else
			class="word-list" 
			scroll-y="true"
			@scrolltolower="loadMore"
		>
			<view class="list-container">
				<view 
					class="word-item" 
					v-for="(wordObj, index) in displayWords" 
					:key="index"
					@click="goToWordDetail(wordObj.word)"
				>
					<view class="word-content">
						<view class="word-info">
							<text class="word-text">{{ wordObj.word }}</text>
							<!-- 移除常用标签 -->
							<view class="pos-badge">
								<text class="pos-badge-text">{{ wordObj.partOfSpeechChinese }}</text>
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
					<text class="no-more-text">已显示全部 {{ filteredWords.length }} 个单词</text>
				</view>
				
				<!-- 分页提示 -->
				<view v-if="hasMore && !showAllWords && displayWords.length > 0" class="load-tip">
					<text class="tip-text">滚动到底部加载更多，或点击上方"显示全部"按钮</text>
				</view>
				
				<!-- 空状态 -->
				<view v-if="!loading && !error && displayWords.length === 0" class="empty-state">
					<text class="empty-text">暂无{{ length }}字母的{{ selectedPartOfSpeechName }}单词</text>
					<text class="empty-subtitle">请选择其他词性或返回选择其他长度</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { sortWordsByCommonness, getCommonWords, isCommonWord } from '@/utils/commonWords.js';
	import localWordsData from '@/utils/localWordsData.js';

	export default {
		data() {
			return {
				length: 0,
				allWords: [], // 存储所有单词对象
				filteredWords: [], // 根据词性筛选后的单词
				displayWords: [], // 当前显示的单词
				loading: false,
				// 移除 refreshing: false,
				error: '',
				hasMore: true,
				currentPage: 1,
				pageSize: 100,
				showAllWords: false,
				// 词性筛选相关
				availablePartsOfSpeech: [],
				selectedPartOfSpeech: 'all',
				selectedPartOfSpeechName: '全部'
			}
		},
		onLoad(options) {
			this.length = parseInt(options.length) || 1;
			// 如果有传入词性参数，设置默认选中的词性
			if (options.partOfSpeech) {
				this.selectedPartOfSpeech = options.partOfSpeech;
				this.selectedPartOfSpeechName = options.partOfSpeechName || '筛选';
			}
			this.loadWords();
		},
		// 移除整个 onPullDownRefresh() 方法
		// onPullDownRefresh() {
		//     this.onRefresh();
		// },
		methods: {
			// 加载单词数据 - 优先使用本地数据
			// 加载单词数据 - 优先使用本地数据
			async loadWords(isRefresh = false) {
				if (this.loading) return;
				
				this.loading = true;
				this.error = '';
				
				if (isRefresh) {
					this.currentPage = 1;
					this.hasMore = true;
					this.allWords = [];
					this.filteredWords = [];
					this.displayWords = [];
					this.availablePartsOfSpeech = [];
				}
				
				try {
					// 从本地数据获取单词
					console.log('开始从本地数据获取单词...');
					await this.loadWordsFromLocal();
					
				} catch (err) {
					console.error('加载单词失败:', err);
					this.error = '加载失败，请检查数据文件';
					
					uni.showToast({
						title: '加载失败',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.loading = false;
					// 移除 this.refreshing = false;
					
					if (isRefresh) {
						uni.stopPullDownRefresh();
					}
				}
			},
			
			// 从本地数据加载单词
			async loadWordsFromLocal() {
				try {
					console.log(`正在从本地数据获取${this.length}字母单词...`);
					
					uni.showToast({
						title: '正在加载单词...',
						icon: 'loading',
						duration: 2000
					});
					
					// 获取单词数据
					const localWords = await localWordsData.getWordsByLength(this.length);
					// 获取可用的词性分类
					const partsOfSpeech = await localWordsData.getAvailablePartsOfSpeech(this.length);
					
					console.log('本地数据获取结果:', localWords.length);
					
					if (localWords && localWords.length > 0) {
						// 按常用程度排序
						const wordList = localWords.map(item => item.word);
						const sortedWords = sortWordsByCommonness(wordList, this.length);
						
						// 重新组织数据，保持排序但包含完整信息
						this.allWords = sortedWords.map(word => {
							const wordObj = localWords.find(item => item.word === word);
							return wordObj || { word, partOfSpeechChinese: '未知' };
						});
						
						this.availablePartsOfSpeech = partsOfSpeech;
						
						// 应用词性筛选
						this.applyPartOfSpeechFilter();
						
						uni.showToast({
							title: `加载完成，共${this.allWords.length}个单词`,
							icon: 'success',
							duration: 2000
						});
					} else {
						throw new Error('本地数据中没有找到对应长度的单词');
					}
				} catch (error) {
					console.error('从本地数据加载单词失败:', error);
					throw error;
				}
			},
			
			// 选择词性
			selectPartOfSpeech(partOfSpeech, partOfSpeechName) {
				this.selectedPartOfSpeech = partOfSpeech;
				this.selectedPartOfSpeechName = partOfSpeechName;
				this.applyPartOfSpeechFilter();
			},
			
			// 应用词性筛选
			applyPartOfSpeechFilter() {
				if (this.selectedPartOfSpeech === 'all') {
					this.filteredWords = [...this.allWords];
				} else {
					this.filteredWords = this.allWords.filter(wordObj => 
						wordObj.partOfSpeech === this.selectedPartOfSpeech
					);
				}
				
				// 重置分页
				this.currentPage = 1;
				this.displayWords = [];
				this.showAllWords = false;
				
				// 加载第一页数据
				this.loadMoreFromCache();
			},
			
			// 从缓存中加载更多数据（前端分页）
			loadMoreFromCache() {
				const startIndex = (this.currentPage - 1) * this.pageSize;
				const endIndex = this.currentPage * this.pageSize;
				const newWords = this.filteredWords.slice(startIndex, endIndex);
				
				if (newWords.length > 0) {
					this.displayWords = [...this.displayWords, ...newWords];
					this.currentPage++;
				}
				
				// 检查是否还有更多数据
				this.hasMore = endIndex < this.filteredWords.length;
			},
			
			// 下拉刷新
			// 移除 onRefresh 方法
			// onRefresh() {
			//     this.refreshing = true;
			//     this.loadWords(true);
			// },
			
			// 加载更多
			loadMore() {
				if (!this.hasMore || this.loading || this.showAllWords) return;
				this.loadMoreFromCache();
			},
			
			// 显示所有单词
			// 修改 showAllWordsMethod 方法
			showAllWordsMethod() {
			this.displayWords = [...this.filteredWords];
			this.showAllWords = true;
			this.hasMore = false;
			
			const typeText = this.selectedPartOfSpeech === 'all' ? '' : this.selectedPartOfSpeechName;
			uni.showToast({
			title: `已显示全部${typeText}${this.filteredWords.length}个单词`,
			icon: 'success',
			duration: 2000
			});
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
	
	/* 词性筛选样式 */
	.pos-filter-container {
		margin: 20rpx 0;
	}
	
	.pos-filter-scroll {
		white-space: nowrap;
	}
	
	.pos-filter-list {
		display: flex;
		gap: 16rpx;
		padding: 0 20rpx;
	}
	
	/* 词性筛选样式 - 修改按钮尺寸 */
	.pos-filter-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8rpx 24rpx; /* 降低高度，增加宽度 */
		border-radius: 20rpx;
		background: rgba(255, 255, 255, 0.2);
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		min-width: 100rpx; /* 增加最小宽度 */
		transition: all 0.2s ease;
	}
	
	.pos-filter-text {
		font-size: 26rpx; /* 稍微增大字体 */
		color: #ffffff;
		font-weight: 500;
	}
	
	/* 移除 pos-filter-count 相关样式 */
	/* 移除 priority-notice 相关样式 */
	/* 移除 common-badge 相关样式 */
	.pos-filter-item.active {
		background: rgba(255, 255, 255, 0.9);
		border-color: #ffffff;
	}
	
	.pos-filter-item:active {
		transform: scale(0.95);
	}
	
	.pos-filter-text {
		font-size: 24rpx;
		color: #ffffff;
		font-weight: 500;
		margin-bottom: 4rpx;
	}
	
	.pos-filter-item.active .pos-filter-text {
		color: #5a67d8;
	}
	
	.pos-filter-count {
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.2);
		padding: 2rpx 8rpx;
		border-radius: 10rpx;
	}
	
	.pos-filter-item.active .pos-filter-count {
		color: #5a67d8;
		background: rgba(90, 103, 216, 0.2);
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
	
	/* 词性标签样式 */
	.pos-badge {
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 12rpx;
		padding: 4rpx 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
	}
	
	.pos-badge-text {
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
		margin-bottom: 16rpx;
		text-align: center;
	}
	
	.error-subtitle {
		font-size: 24rpx;
		color: #718096;
		text-align: center;
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

// 在methods中添加方法
methods: {
	startFlashcardLearning() {
		uni.navigateTo({
			url: `/pages/flashcard/index?length=${this.length}`
		});
	}
}

// 添加CSS样式
.flashcard-entry {
	margin: 20rpx 0;
	
	.flashcard-btn {
		width: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 15rpx;
		padding: 25rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 15rpx;
		transition: transform 0.2s;
		
		&:active {
			transform: scale(0.98);
		}
		
		.btn-icon {
			font-size: 28rpx;
		}
		
		.btn-text {
			font-size: 28rpx;
			font-weight: bold;
		}
	}
}
