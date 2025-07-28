<template>
	<view class="flashcard-container">
		<!-- 进度条 -->
		<view class="progress-header">
			<view class="progress-info">
				<text class="progress-text">{{ currentIndex + 1 }} / {{ wordList.length }}</text>
				<text class="mode-text">{{ isReviewMode ? '复习模式' : '学习模式' }}</text>
			</view>
			<progress :percent="progressPercent" stroke-width="4" activeColor="#007AFF"/>
		</view>

		<!-- 闪卡区域 -->
		<view class="card-area" v-if="currentWord">
			<view class="card" :class="{flipped: showAnswer}" @click="flipCard">
				<view class="card-face card-front">
					<text class="word-text">{{ currentWord.word }}</text>
					<text v-if="currentWord.phonetic" class="phonetic-text">{{ currentWord.phonetic }}</text>
					<view class="audio-btn" @click.stop="playPronunciation">
						<text class="audio-icon">🔊</text>
					</view>
					<text class="flip-hint">点击查看释义</text>
				</view>
				
				<view class="card-face card-back">
					<text class="meaning-text">{{ currentWord.chinese || currentWord.meaning }}</text>
					<text v-if="currentWord.partOfSpeechChinese" class="pos-text">{{ currentWord.partOfSpeechChinese }}</text>
					<text class="flip-hint">点击返回单词</text>
				</view>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="actions" v-if="showAnswer && currentWord">
			<button class="difficulty-btn easy" @click="markDifficulty('easy')">
				<text class="btn-icon">😊</text>
				<text class="btn-text">简单</text>
			</button>
			<button class="difficulty-btn normal" @click="markDifficulty('normal')">
				<text class="btn-icon">😐</text>
				<text class="btn-text">一般</text>
			</button>
			<button class="difficulty-btn hard" @click="markDifficulty('hard')">
				<text class="btn-icon">😰</text>
				<text class="btn-text">困难</text>
			</button>
		</view>

		<!-- 完成界面 -->
		<view v-if="isCompleted" class="completion-screen">
			<text class="completion-title">🎉 学习完成！</text>
			<view class="completion-stats">
				<view class="stat-item">
					<text class="stat-number">{{ completedWords }}</text>
					<text class="stat-label">已学单词</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{ easyCount }}</text>
					<text class="stat-label">简单</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{ hardCount }}</text>
					<text class="stat-label">困难</text>
				</view>
			</view>
			<view class="completion-actions">
				<button class="action-btn primary" @click="restartSession">再来一轮</button>
				<button class="action-btn secondary" @click="goBack">返回</button>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-if="!currentWord && !isCompleted" class="empty-state">
			<text class="empty-title">暂无单词</text>
			<text class="empty-subtitle">请先学习一些单词</text>
			<button class="empty-btn" @click="goToWordList">去学习</button>
		</view>
	</view>
</template>

<script>
import LearningProgress from '@/utils/learningProgress.js';
import localWordsData from '@/utils/localWordsData.js';
import baiduTranslate from '@/utils/baiduTranslate.js';

export default {
	data() {
		return {
			wordList: [],
			currentIndex: 0,
			showAnswer: false,
			isReviewMode: false,
			isCompleted: false,
			completedWords: 0,
			easyCount: 0,
			hardCount: 0,
			length: null
		};
	},
	computed: {
		currentWord() {
			return this.wordList[this.currentIndex] || null;
		},
		progressPercent() {
			return this.wordList.length > 0 ? (this.currentIndex / this.wordList.length) * 100 : 0;
		}
	},
	onLoad(options) {
		this.length = options.length;
		this.isReviewMode = options.mode === 'review';
		this.initWordList();
	},
	methods: {
		// 初始化单词列表
		async initWordList() {
			try {
				if (this.isReviewMode) {
					// 复习模式：获取需要复习的单词
					this.wordList = LearningProgress.getTodayReviewWords();
					if (this.wordList.length === 0) {
						uni.showToast({
							title: '今日无需复习',
							icon: 'none'
						});
						return;
					}
				} else {
					// 学习模式：获取指定长度的单词
					if (this.length) {
						const words = localWordsData.getWordsByLength(parseInt(this.length));
						// 随机选择10个单词
						this.wordList = this.shuffleArray(words).slice(0, 10);
					} else {
						// 智能推荐单词
						this.wordList = await this.getRecommendedWords();
					}
				}
				
				// 为单词添加中文释义
				await this.enrichWordsWithTranslation();
			} catch (error) {
				console.error('初始化单词列表失败:', error);
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				});
			}
		},

		// 获取推荐单词
		async getRecommendedWords() {
			const learnedWords = LearningProgress.getLearnedWords();
			const learnedWordSet = new Set(learnedWords.map(w => w.word));
			
			// 获取3-6字母的简单单词
			let allWords = [];
			for (let len = 3; len <= 6; len++) {
				const words = localWordsData.getWordsByLength(len);
				allWords = allWords.concat(words);
			}
			
			// 过滤掉已学单词
			const newWords = allWords.filter(word => !learnedWordSet.has(word.word));
			
			return this.shuffleArray(newWords).slice(0, 10);
		},

		// 为单词添加翻译
		async enrichWordsWithTranslation() {
			for (let word of this.wordList) {
				if (!word.chinese && !word.meaning) {
					try {
						const translation = await baiduTranslate.translate(word.word || word);
						if (translation && translation.trans_result && translation.trans_result[0]) {
							word.chinese = translation.trans_result[0].dst;
						}
					} catch (error) {
						console.error('翻译失败:', error);
					}
				}
			}
		},

		// 打乱数组
		shuffleArray(array) {
			const shuffled = [...array];
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			return shuffled;
		},

		// 翻转卡片
		flipCard() {
			this.showAnswer = !this.showAnswer;
		},

		// 播放发音
		playPronunciation() {
			if (this.currentWord) {
				baiduTranslate.playTextToSpeech(this.currentWord.word || this.currentWord);
			}
		},

		// 标记难度
		markDifficulty(difficulty) {
			const word = this.currentWord.word || this.currentWord;
			
			if (this.isReviewMode) {
				// 复习模式：记录复习结果
				const isCorrect = difficulty === 'easy';
				LearningProgress.recordReviewResult(word, isCorrect);
			} else {
				// 学习模式：记录新学单词
				LearningProgress.recordWordLearned(word, difficulty);
			}
			
			// 统计
			this.completedWords++;
			if (difficulty === 'easy') this.easyCount++;
			if (difficulty === 'hard') this.hardCount++;
			
			// 下一个单词
			this.nextWord();
		},

		// 下一个单词
		nextWord() {
			this.showAnswer = false;
			
			if (this.currentIndex < this.wordList.length - 1) {
				this.currentIndex++;
			} else {
				// 完成学习
				this.isCompleted = true;
				uni.showToast({
					title: '学习完成！',
					icon: 'success'
				});
			}
		},

		// 重新开始
		restartSession() {
			this.currentIndex = 0;
			this.showAnswer = false;
			this.isCompleted = false;
			this.completedWords = 0;
			this.easyCount = 0;
			this.hardCount = 0;
			this.wordList = this.shuffleArray(this.wordList);
		},

		// 返回
		goBack() {
			uni.navigateBack();
		},

		// 去单词列表
		goToWordList() {
			uni.navigateTo({
				url: '/pages/index/index'
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.flashcard-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 20rpx;
	display: flex;
	flex-direction: column;
}

.progress-header {
	background: rgba(255, 255, 255, 0.9);
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
	
	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		.progress-text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.mode-text {
			font-size: 28rpx;
			color: #666;
			background: #f0f0f0;
			padding: 10rpx 20rpx;
			border-radius: 20rpx;
		}
	}
}

.card-area {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
}

.card {
	width: 600rpx;
	height: 400rpx;
	position: relative;
	transform-style: preserve-3d;
	transition: transform 0.6s;
	cursor: pointer;
	
	&.flipped {
		transform: rotateY(180deg);
	}
}

.card-face {
	position: absolute;
	width: 100%;
	height: 100%;
	background: white;
	border-radius: 30rpx;
	box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	backface-visibility: hidden;
}

.card-front {
	background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
	
	.word-text {
		font-size: 60rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		text-align: center;
	}
	
	.phonetic-text {
		font-size: 32rpx;
		color: #666;
		margin-bottom: 30rpx;
	}
	
	.audio-btn {
		background: #007AFF;
		color: white;
		padding: 20rpx;
		border-radius: 50%;
		margin-bottom: 30rpx;
		
		.audio-icon {
			font-size: 32rpx;
		}
	}
}

.card-back {
	transform: rotateY(180deg);
	background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	color: white;
	
	.meaning-text {
		font-size: 40rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 20rpx;
		line-height: 1.5;
	}
	
	.pos-text {
		font-size: 28rpx;
		opacity: 0.8;
		margin-bottom: 30rpx;
	}
}

.flip-hint {
	font-size: 24rpx;
	color: #999;
	position: absolute;
	bottom: 30rpx;
}

.actions {
	display: flex;
	justify-content: space-around;
	padding: 0 40rpx;
	margin-bottom: 40rpx;
}

.difficulty-btn {
	background: white;
	border: none;
	border-radius: 20rpx;
	padding: 30rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
	transition: transform 0.2s;
	
	&:active {
		transform: scale(0.95);
	}
	
	.btn-icon {
		font-size: 40rpx;
		margin-bottom: 10rpx;
	}
	
	.btn-text {
		font-size: 28rpx;
		color: #333;
	}
	
	&.easy {
		background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
	}
	
	&.normal {
		background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
	}
	
	&.hard {
		background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
	}
}

.completion-screen {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 30rpx;
	padding: 60rpx;
	
	.completion-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 40rpx;
	}
	
	.completion-stats {
		display: flex;
		justify-content: space-around;
		width: 100%;
		margin-bottom: 60rpx;
		
		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.stat-number {
				font-size: 48rpx;
				font-weight: bold;
				color: #007AFF;
				margin-bottom: 10rpx;
			}
			
			.stat-label {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
	
	.completion-actions {
		display: flex;
		gap: 30rpx;
		
		.action-btn {
			padding: 30rpx 60rpx;
			border-radius: 50rpx;
			border: none;
			font-size: 32rpx;
			
			&.primary {
				background: #007AFF;
				color: white;
			}
			
			&.secondary {
				background: #f0f0f0;
				color: #333;
			}
		}
	}
}

.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 30rpx;
	padding: 60rpx;
	
	.empty-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}
	
	.empty-subtitle {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 40rpx;
	}
	
	.empty-btn {
		background: #007AFF;
		color: white;
		padding: 30rpx 60rpx;
		border-radius: 50rpx;
		border: none;
		font-size: 32rpx;
	}
}
</style>