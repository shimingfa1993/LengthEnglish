<template>
	<view class="container">
		<view class="header">
			<text class="word-title">{{ word }}</text>
			<view v-if="phonetic" class="phonetic-section">
				<text class="phonetic">{{ phonetic }}</text>
				<view class="audio-btn" @click="playPronunciation">
					<text class="audio-icon">🔊</text>
					<text class="audio-text">发音</text>
				</view>
			</view>
			<view v-if="chineseTranslation" class="chinese-translation">
				<text class="translation-text">{{ chineseTranslation }}</text>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在使用百度翻译获取单词详情...</text>
		</view>
		
		<!-- 错误状态 -->
		<view v-else-if="error" class="error-container">
			<text class="error-text">{{ error }}</text>
			<button class="retry-btn" @click="loadWordDetail">重试</button>
		</view>
		
		<!-- 单词详情 -->
		<scroll-view v-else class="content" scroll-y="true">
			<view class="detail-container">
				<!-- 场景图片 -->
				<view v-if="wordImage" class="image-section">
					<image :src="wordImage" class="word-image" mode="aspectFill" @error="onImageError"></image>
					<text class="image-caption">{{ word }} 相关场景</text>
				</view>
				
				<!-- 基本信息 -->
				<view class="info-section">
					<text class="section-title">基本信息</text>
					<view class="info-item">
						<text class="info-label">单词:</text>
						<text class="info-value">{{ word }}</text>
					</view>
					<view v-if="phonetic" class="info-item">
						<text class="info-label">音标:</text>
						<view class="phonetic-row">
							<text class="info-value phonetic-text">{{ phonetic }}</text>
							<view class="small-audio-btn" @click="playPronunciation">
								<text class="small-audio-icon">🔊</text>
							</view>
						</view>
					</view>
					<view class="info-item">
						<text class="info-label">中文释义 (百度翻译):</text>
						<text class="info-value chinese-meaning">{{ chineseTranslation || '获取中...' }}</text>
					</view>
					<view v-if="simpleDefinition" class="info-item">
						<text class="info-label">英文释义:</text>
						<text class="info-value simple-meaning">{{ simpleDefinition }}</text>
					</view>
				</view>
				
				<!-- 真实场景例句 -->
				<view v-if="allExamples.length > 0" class="examples-section">
					<text class="section-title">真实场景例句</text>
					<view class="examples-description">
						<text class="examples-desc-text">来自百度翻译的真实使用场景，帮助您更好地理解和运用</text>
					</view>
					<view 
						v-for="(example, index) in allExamples" 
						:key="index"
						class="real-example"
					>
						<view class="example-content">
							<text class="example-en">{{ example.english }}</text>
							<text class="example-cn">{{ example.chinese }}</text>
						</view>
						<view class="example-actions">
							<view class="example-audio" @click="playExampleSentence(example.english)">
								<text class="example-audio-icon">🔊</text>
							</view>
							<view class="example-copy" @click="copyExample(example)">
								<text class="example-copy-icon">📋</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 加载更多例句 -->
				<view v-if="allExamples.length > 0 && allExamples.length < 8" class="load-more-section">
					<button 
						class="load-more-btn" 
						@click="loadMoreExamples"
						:disabled="loadingMoreExamples"
					>
						{{ loadingMoreExamples ? '获取中...' : '获取更多例句' }}
					</button>
				</view>
				
				<!-- 详细释义（可折叠） -->
				<view v-if="definitions.length > 0" class="definitions-section">
					<view class="section-header" @click="toggleDefinitions">
						<text class="section-title">详细释义</text>
						<text class="toggle-icon">{{ showDefinitions ? '▼' : '▶' }}</text>
					</view>
					<view v-if="showDefinitions" class="definitions-content">
						<view 
							v-for="(def, index) in definitions" 
							:key="index"
							class="definition-item"
						>
							<view class="definition-header">
								<text class="part-of-speech">{{ def.partOfSpeech }}</text>
							</view>
							<text class="definition-text">{{ def.definition }}</text>
							<view v-if="def.example" class="example">
								<text class="example-label">例句:</text>
								<text class="example-text">{{ def.example }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 相关单词 -->
				<view v-if="relatedWords.length > 0" class="related-section">
					<text class="section-title">相关单词</text>
					<view class="related-words">
						<text 
							v-for="(relatedWord, index) in relatedWords" 
							:key="index"
							class="related-word"
							@click="goToRelatedWord(relatedWord)"
						>
							{{ relatedWord }}
						</text>
					</view>
				</view>
				
				<!-- 如果没有详细信息 -->
				<view v-if="!loading && !error && definitions.length === 0 && allExamples.length === 0" class="no-detail">
					<text class="no-detail-text">暂无更多详细信息</text>
					<text class="no-detail-subtitle">这是一个 {{ word.length }} 字母的英文单词</text>
					<text class="no-detail-hint">建议检查网络连接以获取百度翻译的详细信息</text>
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
				word: '',
				phonetic: '',
				frequency: '',
				definitions: [],
				relatedWords: [],
				loading: false,
				error: '',
				wordImage: '',
				simpleDefinition: '',
				allExamples: [], // 所有真实例句
				showDefinitions: false,
				audioUrl: '',
				chineseTranslation: '',
				loadingMoreExamples: false
			}
		},
		onLoad(options) {
			this.word = options.word || '';
			if (this.word) {
				this.loadWordDetail();
			} else {
				this.error = '未找到单词信息';
			}
		},
		methods: {
			// 加载单词详情
			async loadWordDetail() {
				if (!this.word) return;
				
				this.loading = true;
				this.error = '';
				
				try {
					// 并行加载所有数据
					await Promise.all([
						this.loadBaiduTranslation(), // 优先使用百度翻译
						this.loadDefinitions(),
						this.loadRelatedWords(),
						this.loadWordImage()
					]);
					
				} catch (err) {
					console.error('加载单词详情失败:', err);
					this.error = '加载失败，请检查网络连接';
					
					uni.showToast({
						title: '加载失败',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.loading = false;
				}
			},
			
			// 使用百度翻译API获取单词详情
			async loadBaiduTranslation() {
				try {
					uni.showLoading({
						title: '使用百度翻译查询中...'
					});
					
					// 获取单词详细信息
					const wordDetails = await baiduTranslate.getWordDetails(this.word);
					
					if (wordDetails) {
						// 设置中文翻译
						this.chineseTranslation = wordDetails.translation;
						
						// 设置音标（如果有）
						if (wordDetails.phonetic) {
							this.phonetic = wordDetails.phonetic;
						}
						
						// 设置发音（如果有）
						if (wordDetails.pronunciation) {
							this.audioUrl = wordDetails.pronunciation;
						}
						
						// 设置释义
						if (wordDetails.definitions && wordDetails.definitions.length > 0) {
							this.definitions = wordDetails.definitions.map(def => ({
								partOfSpeech: def.partOfSpeech || '未知',
								definition: def.meanings ? def.meanings.join('; ') : '',
								example: ''
							}));
						}
					}
					
					// 获取真实例句
					await this.loadRealExamples();
					
					uni.hideLoading();
					
					// 显示成功提示
					uni.showToast({
						title: '百度翻译加载完成',
						icon: 'success',
						duration: 1500
					});
					
				} catch (error) {
					console.error('百度翻译API失败:', error);
					uni.hideLoading();
					
					// 如果百度翻译失败，尝试备用方法
					await this.loadChineseTranslationFallback();
					
					uni.showToast({
						title: '使用备用翻译',
						icon: 'none',
						duration: 1500
					});
				}
			},
			
			// 获取真实例句
			async loadRealExamples() {
				try {
					// 初次加载5个例句
					const examples = await baiduTranslate.getExamples(this.word, 5);
					this.allExamples = examples;
					
					// 如果例句数量少，尝试获取更多
					if (examples.length < 3) {
						console.log('例句数量较少，尝试获取更多...');
						await this.loadMoreExamples();
					}
				} catch (error) {
					console.error('获取真实例句失败:', error);
					this.allExamples = [];
					
					// 如果百度翻译失败，显示提示
					uni.showToast({
						title: '无法获取例句，请检查网络',
						icon: 'none',
						duration: 2000
					});
				}
			},
			
			// 备用翻译方法（当百度翻译API失败时）
			async loadChineseTranslationFallback() {
				// 基础词典数据（简化版）
				const dictionary = {
					// 基础动词
					'add': '添加；增加', 'ask': '问；询问', 'begin': '开始；着手',
					'break': '打破；损坏', 'bring': '带来；拿来', 'build': '建造；建筑',
					'buy': '买；购买', 'call': '叫；呼叫', 'carry': '携带；运送',
					'catch': '抓住；捕捉', 'change': '改变；变化', 'choose': '选择；挑选',
					'clean': '清洁；打扫', 'close': '关闭；结束', 'cook': '烹饪；煮',
					'count': '数；计算', 'cut': '切；割', 'dance': '跳舞；舞蹈',
					'draw': '画；绘制', 'drink': '喝；饮', 'drive': '开车；驾驶',
					'eat': '吃；食用', 'fall': '落下；跌倒', 'feel': '感觉；觉得',
					'find': '找到；发现', 'finish': '完成；结束', 'fly': '飞；飞行',
					'grow': '生长；发展', 'happen': '发生；出现', 'hear': '听见；听到',
					'help': '帮助；援助', 'hold': '拿着；持有', 'hope': '希望；期望',
					'jump': '跳；跳跃', 'keep': '保持；继续', 'learn': '学习；学会',
					'leave': '离开；出发', 'listen': '听；倾听', 'live': '居住；生活',
					'love': '爱；喜爱', 'mean': '意味；表示', 'meet': '遇见；见面',
					'move': '移动；搬家', 'need': '需要；必需', 'open': '打开；开启',
					'play': '玩；播放', 'read': '读；阅读', 'run': '跑；奔跑',
					'say': '说；讲', 'see': '看见；理解', 'show': '展示；显示',
					'sing': '唱；演唱', 'sit': '坐；就座', 'sleep': '睡觉；睡眠',
					'speak': '说话；讲话', 'stand': '站立；起立', 'start': '开始；启动',
					'stop': '停止；停下', 'study': '学习；研究', 'talk': '谈话；交谈',
					'teach': '教；教授', 'tell': '告诉；讲述', 'think': '想；认为；考虑',
					'try': '尝试；试图', 'turn': '转动；转向', 'walk': '走；步行',
					'want': '想要；需要', 'watch': '看；观看', 'work': '工作；运转',
					'write': '写；书写',
					
					// 常见名词
					'animal': '动物；生物', 'apple': '苹果', 'book': '书；书籍',
					'car': '汽车；轿车', 'cat': '猫；猫科动物', 'chair': '椅子；主席',
					'child': '孩子；儿童', 'city': '城市；都市', 'computer': '电脑；计算机',
					'dog': '狗；犬', 'door': '门；门户', 'family': '家庭；家族',
					'food': '食物；食品', 'friend': '朋友；友人', 'home': '家；住所',
					'house': '房子；住宅', 'money': '钱；金钱', 'name': '名字；名称',
					'school': '学校', 'student': '学生', 'teacher': '教师；老师',
					'time': '时间；次；倍', 'water': '水', 'work': '工作；运转',
					'world': '世界；世间',
					
					// 常见形容词
					'bad': '坏的；糟糕的', 'beautiful': '美丽的；漂亮的', 'big': '大的；巨大的',
					'black': '黑色的；黑暗的', 'blue': '蓝色的；忧郁的', 'good': '好的；良好的',
					'great': '伟大的；重要的', 'green': '绿色的；环保的', 'happy': '快乐的；幸福的',
					'large': '大的；巨大的', 'little': '小的；少的', 'long': '长的；远的',
					'new': '新的；新鲜的', 'old': '老的；年老的', 'red': '红色的；红的',
					'right': '正确的；对的', 'small': '小的；微小的', 'white': '白色的；白的',
					'young': '年轻的；幼小的'
				};
				
				// 获取中文翻译
				const translation = dictionary[this.word.toLowerCase()];
				if (translation) {
					this.chineseTranslation = translation;
				} else {
					this.chineseTranslation = '暂无中文释义（建议检查网络连接以使用百度翻译）';
				}
			},
			
			// 加载单词定义（从免费API）
			async loadDefinitions() {
				try {
					const response = await uni.request({
						url: `https://api.dictionaryapi.dev/api/v2/entries/en/${this.word}`,
						method: 'GET'
					});

					if (response.statusCode === 200 && response.data.length > 0) {
						const wordData = response.data[0];
						
						// 获取音标和音频URL（如果百度翻译没有提供）
						if (!this.phonetic && wordData.phonetics && wordData.phonetics.length > 0) {
							const phoneticWithAudio = wordData.phonetics.find(p => p.audio && p.audio.trim() !== '');
							const phoneticWithText = wordData.phonetics.find(p => p.text);
							
							const phoneticData = phoneticWithAudio || phoneticWithText || wordData.phonetics[0];
							
							this.phonetic = phoneticData?.text || '';
							if (phoneticData?.audio && phoneticData.audio.trim() !== '') {
								this.audioUrl = phoneticData.audio.startsWith('http') 
									? phoneticData.audio 
									: `https:${phoneticData.audio}`;
							}
						}
						
						// 获取简单定义（第一个定义）
						if (wordData.meanings && wordData.meanings.length > 0) {
							const firstMeaning = wordData.meanings[0];
							if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
								this.simpleDefinition = firstMeaning.definitions[0].definition || '';
							}
						}
						
						// 获取详细定义（如果百度翻译没有提供）
						if (this.definitions.length === 0 && wordData.meanings && wordData.meanings.length > 0) {
							wordData.meanings.forEach(meaning => {
								if (meaning.definitions && meaning.definitions.length > 0) {
									meaning.definitions.forEach(def => {
										this.definitions.push({
											partOfSpeech: meaning.partOfSpeech || '未知',
											definition: def.definition || '',
											example: def.example || ''
										});
									});
								}
							});
						}
					}
				} catch (err) {
					console.log('英文释义API请求失败:', err);
				}
			},
			
			// 加载相关单词
			async loadRelatedWords() {
				try {
					const response = await uni.request({
						url: 'https://api.datamuse.com/words',
						method: 'GET',
						data: {
							ml: this.word,
							max: 10
						}
					});
					
					if (response.statusCode === 200) {
						this.relatedWords = response.data
							.map(item => item.word)
							.filter(relatedWord => relatedWord !== this.word)
							.slice(0, 8);
					}
				} catch (err) {
					console.log('相关单词API请求失败:', err);
				}
			},
			
			async loadWordImage() {
				try {
					this.wordImage = `https://dummyimage.com/300x200/667eea/ffffff.png&text=${this.word}`;
				} catch (err) {
					this.wordImage = `https://dummyimage.com/300x200/cccccc/ffffff.png&text=${this.word}`;
				}
			},
			
			// 加载更多例句
			async loadMoreExamples() {
				if (this.loadingMoreExamples) return;
				
				this.loadingMoreExamples = true;
				
				try {
					// 获取更多例句（3个）
					const moreExamples = await baiduTranslate.getExamples(this.word, 3);
					
					// 过滤重复的例句
					const existingEnglish = new Set(this.allExamples.map(ex => ex.english));
					const newExamples = moreExamples.filter(ex => !existingEnglish.has(ex.english));
					
					if (newExamples.length > 0) {
						this.allExamples = [...this.allExamples, ...newExamples];
						
						uni.showToast({
							title: `新增${newExamples.length}个例句`,
							icon: 'success',
							duration: 1500
						});
					} else {
						uni.showToast({
							title: '暂无更多例句',
							icon: 'none',
							duration: 1500
						});
					}
				} catch (error) {
					console.error('加载更多例句失败:', error);
					uni.showToast({
						title: '加载失败，请稍后重试',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.loadingMoreExamples = false;
				}
			},
			
			// 复制例句
			copyExample(example) {
				const text = `${example.english}\n${example.chinese}`;
				
				// 尝试使用剪贴板API
				if (uni.setClipboardData) {
					uni.setClipboardData({
						data: text,
						success: () => {
							uni.showToast({
								title: '例句已复制',
								icon: 'success',
								duration: 1500
							});
						},
						fail: () => {
							uni.showToast({
								title: '复制失败',
								icon: 'none',
								duration: 1500
							});
						}
					});
				} else {
					uni.showToast({
						title: '当前环境不支持复制',
						icon: 'none',
						duration: 2000
					});
				}
			},
			
			playPronunciation() {
				// 使用微信小程序的语音接口
				if (typeof wx !== 'undefined') {
					const innerAudioContext = wx.createInnerAudioContext();
					
					// 如果有音频URL，使用音频URL播放
					if (this.audioUrl) {
						innerAudioContext.src = this.audioUrl;
						innerAudioContext.play();
						
						innerAudioContext.onPlay(() => {
							console.log('音频播放开始');
						});
						
						innerAudioContext.onError((res) => {
							console.error('音频播放失败:', res);
							uni.showToast({
								title: '音频播放失败',
								icon: 'none',
								duration: 2000
							});
						});
					} else {
						// 如果没有音频URL，提示用户
						uni.showToast({
							title: '暂无音频资源',
							icon: 'none',
							duration: 2000
						});
					}
				} else {
					uni.showToast({
						title: '当前环境不支持发音',
						icon: 'none',
						duration: 2000
					});
				}
			},
			
			// 播放例句发音
			playExampleSentence(sentence) {
				uni.showToast({
					title: '暂不支持例句发音',
					icon: 'none',
					duration: 2000
				});
			},
			
			// 切换定义显示
			toggleDefinitions() {
				this.showDefinitions = !this.showDefinitions;
			},
			
			// 图片加载错误处理
			onImageError() {
				this.wordImage = `https://via.placeholder.com/300x200/667eea/ffffff?text=${this.word}`;
			},
			
			// 跳转到相关单词
			goToRelatedWord(relatedWord) {
				uni.redirectTo({
					url: `/pages/worddetail/index?word=${encodeURIComponent(relatedWord)}`
				});
			}
		}
	}
</script>

<style scoped>
	.container {
		padding: 30rpx;
		min-height: 100vh;
		background: #f8f9fa;
	}
	
	.header {
		background: #6c5ce7;
		padding: 40rpx 30rpx;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(108, 92, 231, 0.2);
	}
	
	.word-title {
		color: #ffffff;
		font-size: 48rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
	}
	
	.phonetic-section {
		display: flex;
		align-items: center;
		margin-top: 16rpx;
	}
	
	.phonetic {
		color: rgba(255, 255, 255, 0.9);
		font-size: 32rpx;
		margin-right: 20rpx;
	}
	
	.audio-btn {
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.2);
		padding: 8rpx 16rpx;
		border-radius: 30rpx;
		cursor: pointer;
	}
	
	.audio-icon {
		font-size: 32rpx;
		margin-right: 8rpx;
	}
	
	.audio-text {
		color: #ffffff;
		font-size: 24rpx;
	}
	
	.content {
		flex: 1;
		overflow-y: auto;
	}
	
	.detail-container {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	.section-title {
		font-size: 32rpx;
		color: #2d3748;
		font-weight: bold;
		margin-bottom: 24rpx;
	}
	
	.info-section {
		margin-bottom: 40rpx;
	}
	
	.info-item {
		margin-bottom: 20rpx;
		padding: 16rpx 24rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
	}
	
	.info-label {
		color: #718096;
		font-size: 26rpx;
		margin-bottom: 8rpx;
		display: block;
	}
	
	.info-value {
		color: #2d3748;
		font-size: 28rpx;
		display: block;
	}
	
	.info-value.chinese-meaning {
		color: #4a5568;
		font-size: 28rpx;
		line-height: 1.5;
	}
	
	.phonetic-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}
	
	.phonetic-text {
		flex: 1;
	}
	
	.small-audio-btn {
		padding: 8rpx 16rpx;
		background: #6c5ce7;
		border-radius: 8rpx;
		cursor: pointer;
	}
	
	.small-audio-icon {
		color: #ffffff;
		font-size: 24rpx;
	}
	
	.example-section {
		margin-bottom: 40rpx;
	}
	
	.example-item {
		margin-bottom: 24rpx;
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
	}
	
	.example-text {
		color: #2d3748;
		font-size: 28rpx;
		margin-bottom: 8rpx;
	}
	
	.example-translation {
		color: #718096;
		font-size: 26rpx;
	}
	
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background: #f8f9fa;
	}
	
	.loading-text {
		color: #718096;
		font-size: 28rpx;
		margin-top: 20rpx;
	}
	
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background: #f8f9fa;
		padding: 30rpx;
	}
	
	.error-text {
		color: #e53e3e;
		font-size: 28rpx;
		text-align: center;
		margin-top: 20rpx;
	}
	
	.retry-btn {
		margin-top: 30rpx;
		padding: 16rpx 32rpx;
		background: #6c5ce7;
		color: #ffffff;
		border-radius: 8rpx;
		font-size: 28rpx;
	}
	
	/* 图片区域 */
	.image-section {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		text-align: center;
	}
	
	.word-image {
		width: 100%;
		height: 400rpx;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
	}
	
	.image-caption {
		font-size: 26rpx;
		color: #718096;
	}
	
	/* 真实例句 */
	.examples-section {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}
	
	.examples-description {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20rpx 24rpx;
		border-radius: 12rpx;
		margin-bottom: 24rpx;
	}
	
	.examples-desc-text {
		color: #ffffff;
		font-size: 24rpx;
		text-align: center;
		display: block;
	}
	
	.real-example {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #e2e8f0;
		gap: 20rpx;
	}
	
	.real-example:last-child {
		border-bottom: none;
	}
	
	.example-content {
		flex: 1;
		min-width: 0;
	}
	
	.example-en {
		display: block;
		font-size: 30rpx;
		color: #2d3748;
		font-weight: 500;
		margin-bottom: 12rpx;
		line-height: 1.5;
		word-wrap: break-word;
	}
	
	.example-cn {
		display: block;
		font-size: 26rpx;
		color: #718096;
		line-height: 1.5;
		word-wrap: break-word;
	}
	
	.example-actions {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		flex-shrink: 0;
	}
	
	.example-audio, .example-copy {
		background: #f0f4ff;
		border-radius: 50%;
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.example-audio:active, .example-copy:active {
		background: #e2e8f0;
		transform: scale(0.95);
	}
	
	.example-audio-icon, .example-copy-icon {
		font-size: 18rpx;
	}
	
	.example-copy {
		background: #fff5f5;
	}
	
	.example-copy:active {
		background: #fed7d7;
	}
	
	/* 加载更多按钮 */
	.load-more-section {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		text-align: center;
	}
	
	.load-more-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #ffffff;
		font-size: 28rpx;
		padding: 24rpx 48rpx;
		border-radius: 50rpx;
		border: none;
		font-weight: 500;
		transition: all 0.3s ease;
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	}
	
	.load-more-btn:disabled {
		background: #cbd5e0;
		box-shadow: none;
		transform: none;
	}
	
	.load-more-btn:not(:disabled):active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.4);
	}
	
	/* 可折叠定义 */
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 12rpx;
		border-bottom: 2rpx solid #e2e8f0;
		margin-bottom: 24rpx;
	}
	
	.toggle-icon {
		font-size: 24rpx;
		color: #718096;
		transition: transform 0.3s ease;
	}
	
	.definitions-content {
		animation: fadeIn 0.3s ease;
	}
	
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	/* 定义部分 */
	.definition-item {
		margin-bottom: 28rpx;
		padding-bottom: 28rpx;
		border-bottom: 1rpx solid #e2e8f0;
	}
	
	.definition-item:last-child {
		margin-bottom: 0;
		padding-bottom: 0;
		border-bottom: none;
	}
	
	.definition-header {
		margin-bottom: 12rpx;
	}
	
	.part-of-speech {
		background: #667eea;
		color: white;
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 12rpx;
		text-transform: uppercase;
		font-weight: bold;
	}
	
	.definition-text {
		font-size: 28rpx;
		color: #2d3748;
		line-height: 1.6;
		margin-bottom: 12rpx;
	}
	
	.example {
		background: #f7fafc;
		padding: 16rpx;
		border-radius: 8rpx;
		border-left: 4rpx solid #667eea;
	}
	
	.example-label {
		font-size: 24rpx;
		color: #718096;
		margin-right: 12rpx;
	}
	
	.example-text {
		font-size: 26rpx;
		color: #4a5568;
		font-style: italic;
	}
	
	/* 相关单词 */
	.related-words {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}
	
	.related-word {
		background: #edf2f7;
		color: #667eea;
		font-size: 26rpx;
		padding: 12rpx 20rpx;
		border-radius: 20rpx;
		border: 2rpx solid #e2e8f0;
		text-transform: lowercase;
	}
	
	.related-word:active {
		background: #667eea;
		color: white;
	}
	
	/* 无详情状态 */
	.no-detail {
		text-align: center;
		background: #ffffff;
		border-radius: 16rpx;
		padding: 80rpx 40rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}
	
	.no-detail-text {
		display: block;
		font-size: 32rpx;
		color: #4a5568;
		margin-bottom: 16rpx;
	}
	
	.no-detail-subtitle {
		display: block;
		font-size: 26rpx;
		color: #718096;
		margin-bottom: 12rpx;
	}
	
	.no-detail-hint {
		display: block;
		font-size: 24rpx;
		color: #a0aec0;
		font-style: italic;
	}
	
	.chinese-translation {
		margin-top: 16rpx;
		padding: 0 20rpx;
	}
	
	.translation-text {
		font-size: 32rpx;
		color: #ffffff;
		text-align: center;
		display: block;
	}
</style> 