<template>
	<view class="learning-container">
		<!-- 学习进度头部 -->
		<view class="learning-header">
			<view class="progress-info">
				<text class="length-info">{{ wordLength }}字母单词</text>
				<text class="progress-text">{{ currentIndex + 1 }}/{{ totalWords }}</text>
			</view>
			<view class="progress-bar">
				<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
			</view>
		</view>

		<!-- 单词学习卡片 -->
		<view class="word-card" v-if="currentWord">
			<view class="word-content">
				<text class="word-english">{{ currentWord.word }}</text>
				
				<!-- 音标和播放按钮 -->
				<view class="phonetic-container">
					<text class="word-phonetic" v-if="currentWord.phonetic">{{ currentWord.phonetic }}</text>
					<view class="pronunciation-btn" @click="playPronunciation" :class="{ playing: isPlaying }">
						<text class="play-icon">{{ isPlaying ? '⏸️' : '🔊' }}</text>
					</view>
				</view>
				
				<!-- 中文释义（可切换显示/隐藏） -->
				<view class="word-meaning" v-if="showMeaning">
					<text class="meaning-text">{{ currentWord.chinese }}</text>
				</view>
				
				<!-- 显示释义按钮 -->
				<button class="show-meaning-btn" v-if="!showMeaning" @click="toggleMeaning">
					点击查看释义
				</button>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-buttons">
			<button class="action-btn know-btn" @click="markAsKnown" :disabled="!showMeaning">
				认识
			</button>
			<button class="action-btn unknown-btn" @click="markAsUnknown" :disabled="!showMeaning">
				不认识
			</button>
		</view>

		<!-- 学习完成提示 -->
		<uni-popup ref="completePopup" type="center">
			<view class="complete-popup">
				<text class="complete-title">🎉 学习完成！</text>
				<text class="complete-text">今日{{ wordLength }}字母单词学习完成</text>
				<view class="complete-stats">
					<text class="stat-item">认识：{{ knownCount }}个</text>
					<text class="stat-item">不认识：{{ unknownCount }}个</text>
				</view>
				<view class="complete-actions">
					<button class="complete-btn" @click="backToHome">返回首页</button>
					<button class="complete-btn primary" @click="reviewUnknown" v-if="unknownCount > 0">
						复习不认识的
					</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import localWordsData from '@/utils/localWordsData.js';
import { api } from '@/utils/api.js';

export default {
	data() {
		return {
			wordLength: 3, // 单词长度
			wordList: [], // 当前学习的单词列表
			currentIndex: 0, // 当前单词索引
			showMeaning: false, // 是否显示释义
			knownWords: [], // 认识的单词
			unknownWords: [], // 不认识的单词
			totalWords: 10, // 每次学习的单词数量
			isPlaying: false, // 是否正在播放语音
			audioContext: null // 音频上下文
		};
	},
	computed: {
		currentWord() {
			return this.wordList[this.currentIndex] || null;
		},
		progressPercent() {
			return Math.round((this.currentIndex / this.totalWords) * 100);
		},
		knownCount() {
			return this.knownWords.length;
		},
		unknownCount() {
			return this.unknownWords.length;
		}
	},
	onLoad(options) {
		console.log('学习页面接收到的参数:', options);
		if (options.length) {
			this.wordLength = parseInt(options.length);
			console.log('解析后的单词长度:', this.wordLength);
		} else {
			console.log('没有接收到length参数，使用默认值3');
			this.wordLength = 3;
		}
		this.loadWords();
	},
	methods: {
		// 加载单词
		// 加载单词
		// 在loadWords方法中添加调试
		async loadWords() {
			try {
				console.log('开始加载单词，长度:', this.wordLength);
				// 添加 await 关键字
				const allWords = await localWordsData.getWordsByLength(this.wordLength);
				console.log('获取到的单词数量:', allWords ? allWords.length : 0);
				console.log('单词数据示例:', allWords ? allWords.slice(0, 3) : 'null');
				
				if (!allWords || allWords.length === 0) {
					uni.showToast({
						title: `没有找到${this.wordLength}字母的单词`,
						icon: 'none'
					});
					return;
				}
				
				// 随机选择10个单词
				this.wordList = this.getRandomWords(allWords, this.totalWords);
				console.log('最终选择的单词列表:', this.wordList);
				
			} catch (error) {
				console.error('加载单词失败:', error);
				uni.showToast({
					title: '加载单词失败',
					icon: 'none'
				});
			}
		},
		
		// 随机获取指定数量的单词
		getRandomWords(words, count) {
			const shuffled = [...words].sort(() => 0.5 - Math.random());
			return shuffled.slice(0, Math.min(count, shuffled.length));
		},
		
		// 切换释义显示
		toggleMeaning() {
			this.showMeaning = true;
		},
		
		// 标记为认识
		markAsKnown() {
			this.knownWords.push(this.currentWord);
			this.nextWord();
		},
		
		// 标记为不认识
		markAsUnknown() {
			this.unknownWords.push(this.currentWord);
			this.nextWord();
		},
		
		// 下一个单词
		nextWord() {
			this.stopPronunciation(); // 停止当前播放
			this.showMeaning = false;
			this.currentIndex++;
			
			if (this.currentIndex >= this.wordList.length) {
				// 学习完成
				this.completeLearning();
			}
		},
		
		// 完成学习
		async completeLearning() {
			// 记录学习进度到后端
			try {
				await api.recordLearning({
					wordLength: this.wordLength,
					knownWords: this.knownWords,
					unknownWords: this.unknownWords,
					totalWords: this.wordList.length
				});
			} catch (error) {
				console.error('记录学习进度失败:', error);
			}
			
			// 显示完成弹窗
			this.$refs.completePopup.open();
		},
		
		// 返回首页
		backToHome() {
			uni.navigateBack();
		},
		
		// 复习不认识的单词
		reviewUnknown() {
			this.wordList = [...this.unknownWords];
			this.currentIndex = 0;
			this.showMeaning = false;
			this.knownWords = [];
			this.unknownWords = [];
			this.$refs.completePopup.close();
		},
		
		// 播放单词发音
		playPronunciation() {
			if (!this.currentWord || !this.currentWord.word) {
				return;
			}
			
			if (this.isPlaying) {
				// 如果正在播放，停止播放
				this.stopPronunciation();
				return;
			}
			
			this.isPlaying = true;
			
			// 直接使用在线TTS服务
			this.playOnlineTTS();
		},
		
		// 停止发音播放
		stopPronunciation() {
			// 停止音频播放
			if (this.audioContext) {
				this.audioContext.pause();
				this.audioContext = null;
			}
			this.isPlaying = false;
		},
		
		// 在线TTS服务
		playOnlineTTS() {
			const word = this.currentWord.word;
			// 使用有道词典的TTS服务
			const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=1`;
			
			// 创建音频上下文
			const innerAudioContext = uni.createInnerAudioContext();
			this.audioContext = innerAudioContext;
			
			// 设置音频源
			innerAudioContext.src = audioUrl;
			
			// 监听播放事件
			innerAudioContext.onPlay(() => {
				console.log('开始播放音频');
			});
			
			// 监听播放结束
			innerAudioContext.onEnded(() => {
				console.log('音频播放结束');
				this.isPlaying = false;
				this.audioContext = null;
			});
			
			// 监听播放错误
			innerAudioContext.onError((error) => {
				console.error('音频播放失败:', error);
				this.isPlaying = false;
				this.audioContext = null;
				uni.showToast({
					title: '语音播放失败',
					icon: 'none'
				});
			});
			
			// 开始播放
			innerAudioContext.play();
		},
		
		// 下一个单词时停止当前播放
		nextWord() {
			this.stopPronunciation(); // 停止当前播放
			this.showMeaning = false;
			this.currentIndex++;
			
			if (this.currentIndex >= this.wordList.length) {
				// 学习完成
				this.completeLearning();
			}
		}
	}
};
</script>

<style scoped lang="scss">
.learning-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx;
	display: flex;
	flex-direction: column;
}

.learning-header {
	margin-bottom: 60rpx;
	
	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		.length-info {
			font-size: 32rpx;
			color: white;
			font-weight: bold;
		}
		
		.progress-text {
			font-size: 28rpx;
			color: rgba(255, 255, 255, 0.8);
		}
	}
	
	.progress-bar {
		height: 8rpx;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4rpx;
		overflow: hidden;
		
		.progress-fill {
			height: 100%;
			background: white;
			border-radius: 4rpx;
			transition: width 0.3s ease;
		}
	}
}

.word-card {
	flex: 1;
	background: white;
	border-radius: 24rpx;
	padding: 60rpx 40rpx;
	margin-bottom: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
	
	.word-content {
		text-align: center;
		width: 100%;
		
		.word-english {
			display: block;
			font-size: 64rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
		}
		
		.word-phonetic {
			display: block;
			font-size: 32rpx;
			color: #666;
			margin-bottom: 40rpx;
		}
		
		.word-meaning {
			padding: 30rpx;
			background: #f0f4ff;
			border-radius: 16rpx;
			margin-top: 40rpx;
			
			.meaning-text {
				font-size: 36rpx;
				color: #333;
				line-height: 1.5;
			}
		}
		
		.show-meaning-btn {
			margin-top: 40rpx;
			padding: 20rpx 40rpx;
			background: #667eea;
			color: white;
			border: none;
			border-radius: 50rpx;
			font-size: 28rpx;
		}
	}
}

.action-buttons {
	display: flex;
	gap: 30rpx;
	
	.action-btn {
		flex: 1;
		padding: 30rpx;
		border: none;
		border-radius: 16rpx;
		font-size: 32rpx;
		font-weight: bold;
		transition: all 0.3s ease;
		
		&:disabled {
			opacity: 0.5;
		}
		
		&.know-btn {
			background: #4CAF50;
			color: white;
		}
		
		&.unknown-btn {
			background: #FF5722;
			color: white;
		}
	}
}

.complete-popup {
	background: white;
	border-radius: 24rpx;
	padding: 60rpx 40rpx;
	text-align: center;
	max-width: 600rpx;
	
	.complete-title {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}
	
	.complete-text {
		display: block;
		font-size: 32rpx;
		color: #666;
		margin-bottom: 40rpx;
	}
	
	.complete-stats {
		display: flex;
		justify-content: space-around;
		margin-bottom: 40rpx;
		
		.stat-item {
			font-size: 28rpx;
			color: #333;
		}
	}
	
	.complete-actions {
		display: flex;
		gap: 20rpx;
		
		.complete-btn {
			flex: 1;
			padding: 24rpx;
			border: 2rpx solid #667eea;
			border-radius: 12rpx;
			font-size: 28rpx;
			background: white;
			color: #667eea;
			
			&.primary {
				background: #667eea;
				color: white;
			}
		}
	}
}

@keyframes pulse {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
	100% {
		transform: scale(1);
	}
}
</style>