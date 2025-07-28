// 本地单词数据处理工具
// 用于从 words_by_length_and_pos.json 获取单词信息

// 直接导入JSON数据
import wordsData from './words_by_length_and_pos.json';

class LocalWordsData {
	constructor() {
		this.wordsData = wordsData;
	}

	// 加载本地单词数据 - 现在是同步的
	async loadWordsData() {
		if (this.wordsData) {
			console.log('本地单词数据已加载');
			return this.wordsData;
		} else {
			throw new Error('本地单词数据加载失败');
		}
	}

	// 根据单词长度获取所有单词
	async getWordsByLength(length) {
		try {
			const data = this.wordsData;
			const lengthData = data[length.toString()];
			
			if (!lengthData) {
				return [];
			}

			const allWords = [];
			
			// 遍历所有词性分类
			for (const [posType, words] of Object.entries(lengthData)) {
				if (Array.isArray(words)) {
					words.forEach(wordObj => {
						allWords.push({
							word: wordObj.word,
							chinese: wordObj.chinese,
							partOfSpeech: posType,
							partOfSpeechChinese: this.getPartOfSpeechChinese(posType)
						});
					});
				}
			}

			return allWords;
		} catch (error) {
			console.error('获取单词失败:', error);
			return [];
		}
	}

	// 根据单词查找详细信息
	async getWordDetails(word) {
		try {
			const data = this.wordsData;
			const wordLower = word.toLowerCase();
			
			// 遍历所有长度
			for (const [length, lengthData] of Object.entries(data)) {
				// 遍历所有词性分类
				for (const [posType, words] of Object.entries(lengthData)) {
					if (Array.isArray(words)) {
						const foundWord = words.find(w => w.word.toLowerCase() === wordLower);
						if (foundWord) {
							return {
								word: foundWord.word,
								chinese: foundWord.chinese,
								partOfSpeech: posType,
								partOfSpeechChinese: this.getPartOfSpeechChinese(posType),
								length: parseInt(length),
								// 提取英文释义
								englishDefinition: this.extractEnglishDefinition(foundWord.chinese)
							};
						}
					}
				}
			}

			return null;
		} catch (error) {
			console.error('查找单词详情失败:', error);
			return null;
		}
	}

	// 获取词性的中文名称
	getPartOfSpeechChinese(posType) {
		const posMap = {
			'名词_nouns': '名词',
			'动词_verbs': '动词',
			'形容词_adjectives': '形容词',
			'副词_adverbs': '副词',
			'介词_prepositions': '介词',
			'连词_conjunctions': '连词',
			'代词_pronouns': '代词',
			'冠词_articles': '冠词',
			'助动词_auxiliaries': '助动词',
			'感叹词_interjections': '感叹词',
			'其他_others': '其他'
		};
		return posMap[posType] || posType;
	}

	// 从中文释义中提取英文定义（如果有的话）
	extractEnglishDefinition(chinese) {
		if (!chinese) return '';
		
		// 尝试提取英文部分（通常在句子末尾或括号中）
		const englishMatch = chinese.match(/[a-zA-Z][a-zA-Z\s,;.()]+/g);
		if (englishMatch && englishMatch.length > 0) {
			// 过滤掉单个字母和很短的匹配
			const meaningfulEnglish = englishMatch.filter(match => 
				match.trim().length > 3 && 
				match.includes(' ') // 包含空格，说明是短语或句子
			);
			if (meaningfulEnglish.length > 0) {
				return meaningfulEnglish[0].trim();
			}
		}
		
		return '';
	}

	// 根据词性获取单词
	async getWordsByPartOfSpeech(length, partOfSpeech) {
		try {
			const data = this.wordsData;
			const lengthData = data[length.toString()];
			
			if (!lengthData || !lengthData[partOfSpeech]) {
				return [];
			}

			return lengthData[partOfSpeech].map(wordObj => ({
				word: wordObj.word,
				chinese: wordObj.chinese,
				partOfSpeech: partOfSpeech,
				partOfSpeechChinese: this.getPartOfSpeechChinese(partOfSpeech)
			}));
		} catch (error) {
			console.error('获取词性单词失败:', error);
			return [];
		}
	}

	// 获取所有可用的词性分类
	async getAvailablePartsOfSpeech(length) {
		try {
			const data = this.wordsData;
			const lengthData = data[length.toString()];
			
			if (!lengthData) {
				return [];
			}

			return Object.keys(lengthData).map(posType => ({
				key: posType,
				name: this.getPartOfSpeechChinese(posType),
				count: lengthData[posType].length
			}));
		} catch (error) {
			console.error('获取词性分类失败:', error);
			return [];
		}
	}
}

// 创建单例实例
const localWordsData = new LocalWordsData();

export default localWordsData;

// 导出常用方法
export {
	localWordsData
};