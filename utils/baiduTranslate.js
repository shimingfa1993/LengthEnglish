// 百度翻译API工具类
import CryptoJS from 'crypto-js';

class BaiduTranslateAPI {
	constructor() {
		this.appId = '20250708002400959';
		this.secretKey = 'V1ot7I2zVu2xKtbzb7id';
		this.baseUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
		this.dictUrl = 'https://fanyi-api.baidu.com/api/trans/vip/fieldtranslate';
	}

	// 生成签名
	generateSign(query, salt) {
		const signStr = this.appId + query + salt + this.secretKey;
		return CryptoJS.MD5(signStr).toString();
	}

	// 通用翻译
	async translate(text, from = 'en', to = 'zh') {
		const salt = Date.now().toString();
		const sign = this.generateSign(text, salt);

		try {
			const response = await uni.request({
				url: this.baseUrl,
				method: 'POST',
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: {
					q: text,
					from: from,
					to: to,
					appid: this.appId,
					salt: salt,
					sign: sign
				}
			});

			if (response.statusCode === 200 && response.data) {
				if (response.data.error_code) {
					throw new Error(`百度翻译API错误: ${response.data.error_msg}`);
				}
				return response.data;
			} else {
				throw new Error('翻译请求失败');
			}
		} catch (error) {
			console.error('翻译失败:', error);
			throw error;
		}
	}

	// 词典查询 - 获取单词的详细信息（音标、释义、例句等）
	async getWordDetails(word) {
		try {
			// 1. 先获取基本翻译
			const basicTranslation = await this.translate(word);
			
			// 2. 使用词典API获取更详细信息（如果可用）
			const dictResult = await this.getDictionary(word);
			
			// 3. 整合结果
			const result = {
				word: word,
				translation: basicTranslation.trans_result?.[0]?.dst || '',
				phonetic: '',
				definitions: [],
				examples: [],
				pronunciation: ''
			};

			// 如果有词典结果，使用词典信息
			if (dictResult && dictResult.dict_result) {
				const dictData = dictResult.dict_result;
				
				// 提取音标
				if (dictData.simple_means) {
					result.phonetic = dictData.simple_means.word_name || '';
					
					// 提取词性和释义
					if (dictData.simple_means.symbols && dictData.simple_means.symbols.length > 0) {
						const symbol = dictData.simple_means.symbols[0];
						result.phonetic = symbol.ph_en || symbol.ph_am || result.phonetic;
						
						if (symbol.parts) {
							result.definitions = symbol.parts.map(part => ({
								partOfSpeech: part.part || '',
								meanings: part.means || []
							}));
						}
					}
				}

				// 提取例句
				if (dictData.voice) {
					result.pronunciation = dictData.voice;
				}
			}

			return result;
		} catch (error) {
			console.error('获取单词详情失败:', error);
			// 返回基本翻译作为备选
			try {
				const basicTranslation = await this.translate(word);
				return {
					word: word,
					translation: basicTranslation.trans_result?.[0]?.dst || '',
					phonetic: '',
					definitions: [],
					examples: [],
					pronunciation: ''
				};
			} catch (basicError) {
				throw new Error('获取单词信息失败');
			}
		}
	}

	// 词典查询（需要专门的词典API权限）
	async getDictionary(word) {
		const salt = Date.now().toString();
		const sign = this.generateSign(word, salt);

		try {
			const response = await uni.request({
				url: 'https://fanyi-api.baidu.com/api/trans/vip/dict',
				method: 'POST',
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: {
					q: word,
					from: 'en',
					to: 'zh',
					appid: this.appId,
					salt: salt,
					sign: sign
				}
			});

			if (response.statusCode === 200 && response.data) {
				if (response.data.error_code && response.data.error_code !== 52004) {
					// 52004表示暂不支持该查询，不算错误
					console.log('词典查询提示:', response.data.error_msg);
				}
				return response.data;
			}
		} catch (error) {
			console.log('词典查询失败，使用基本翻译:', error);
		}
		
		return null;
	}

	// 获取例句
	async getExamples(word, count = 5) {
		try {
			// 构造一些包含该单词的常见例句查询
			const exampleQueries = [
				`${word} example sentence`,
				`use ${word} in a sentence`,
				`${word} sentence example`
			];

			const examples = [];
			
			for (let i = 0; i < Math.min(exampleQueries.length, count); i++) {
				try {
					const result = await this.translate(exampleQueries[i], 'en', 'zh');
					if (result.trans_result && result.trans_result[0]) {
						examples.push({
							english: exampleQueries[i],
							chinese: result.trans_result[0].dst
						});
					}
				} catch (err) {
					console.log('获取例句失败:', err);
				}
			}

			return examples;
		} catch (error) {
			console.error('获取例句失败:', error);
			return [];
		}
	}

	// 批量翻译
	async batchTranslate(textArray, from = 'en', to = 'zh') {
		const results = [];
		
		// 逐个翻译以避免API限制
		for (const text of textArray) {
			try {
				const result = await this.translate(text, from, to);
				results.push({
					original: text,
					translation: result.trans_result?.[0]?.dst || '',
					success: true
				});
				
				// 添加延迟以避免API频率限制
				await new Promise(resolve => setTimeout(resolve, 100));
			} catch (error) {
				results.push({
					original: text,
					translation: '',
					success: false,
					error: error.message
				});
			}
		}
		
		return results;
	}

	// 检测语言
	async detectLanguage(text) {
		try {
			const result = await this.translate(text, 'auto', 'zh');
			return result.from || 'unknown';
		} catch (error) {
			console.error('语言检测失败:', error);
			return 'unknown';
		}
	}
}

// 创建单例实例
const baiduTranslate = new BaiduTranslateAPI();

export default baiduTranslate; 