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
	// 修改后的getExamples方法
	async getExamples(word, count = 5) {
	    try {
	        // 首先尝试从词典API获取例句
	        const dictResult = await this.getDictionary(word);
	        
	        if (dictResult && dictResult.dict_result && dictResult.dict_result.simple_means) {
	            const dictData = dictResult.dict_result.simple_means;
	            
	            // 提取真实例句
	            if (dictData.symbols && dictData.symbols.length > 0) {
	                const symbol = dictData.symbols[0];
	                if (symbol.parts) {
	                    const examples = [];
	                    
	                    for (const part of symbol.parts) {
	                        if (part.means) {
	                            for (const mean of part.means) {
	                                // 百度词典API通常在means中包含例句
	                                if (mean.includes('例：') || mean.includes('Example:')) {
	                                    // 提取例句部分
	                                    const exampleMatch = mean.match(/例：(.+?)(?:；|$)/) || mean.match(/Example: (.+?)(?:;|$)/);
	                                    if (exampleMatch && exampleMatch[1]) {
	                                        examples.push({
	                                            english: exampleMatch[1].trim(),
	                                            chinese: await this.translate(exampleMatch[1].trim(), 'en', 'zh').then(res => res.trans_result?.[0]?.dst || '')
	                                        });
	                                    }
	                                }
	                            }
	                        }
	                    }
	                    
	                    if (examples.length > 0) {
	                        return examples.slice(0, count);
	                    }
	                }
	            }
	        }
	        
	        // 如果词典API没有返回例句，使用备用方案
	        // 可以尝试调用其他例句API或使用预定义的常见例句
	        return await this.getFallbackExamples(word, count);
	        
	    } catch (error) {
	        console.error('获取例句失败:', error);
	        return await this.getFallbackExamples(word, count);
	    }
	}
	
	// 备用例句获取方法
	async getFallbackExamples(word, count = 5) {
	    // 这里可以使用其他免费的例句API，或者预定义的常见例句模板
	    const commonPatterns = [
	        `I ${word} every day.`,
	        `This is a good ${word}.`,
	        `We need to ${word} now.`,
	        `The ${word} is important.`,
	        `Please ${word} carefully.`
	    ];
	    
	    const examples = [];
	    for (let i = 0; i < Math.min(commonPatterns.length, count); i++) {
	        try {
	            const chinese = await this.translate(commonPatterns[i], 'en', 'zh');
	            examples.push({
	                english: commonPatterns[i],
	                chinese: chinese.trans_result?.[0]?.dst || ''
	            });
	        } catch (err) {
	            console.log('备用例句获取失败:', err);
	        }
	    }
	    
	    return examples;
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

	// 语音播放方法
	async playTextToSpeech(text, language = 'en') {
		try {
			// 使用百度语音合成API（如果有权限）或备用TTS服务
			const ttsUrls = [
				// 主要TTS服务
				`https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodeURIComponent(text)}`,
				// 备用TTS服务
				`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=1`,
				// 另一个备用服务
				`https://fanyi.baidu.com/gettts?lan=${language}&text=${encodeURIComponent(text)}&spd=3&source=web`
			];

			return {
				success: true,
				text: text,
				language: language,
				ttsUrls: ttsUrls,
				playAudio: function(onSuccess, onError) {
					if (typeof wx !== 'undefined') {
						const innerAudioContext = wx.createInnerAudioContext();
						
						// 尝试播放第一个URL
						let currentUrlIndex = 0;
						
						const tryPlayUrl = () => {
							if (currentUrlIndex >= ttsUrls.length) {
								if (onError) onError('所有TTS服务都不可用');
								return;
							}
							
							innerAudioContext.src = ttsUrls[currentUrlIndex];
							
							innerAudioContext.onPlay(() => {
								console.log(`TTS播放开始 (服务${currentUrlIndex + 1}):`, text);
								if (onSuccess) onSuccess();
							});
							
							innerAudioContext.onError((res) => {
								console.error(`TTS服务${currentUrlIndex + 1}播放失败:`, res);
								currentUrlIndex++;
								tryPlayUrl(); // 尝试下一个URL
							});
							
							try {
								innerAudioContext.play();
							} catch (error) {
								console.error(`播放TTS服务${currentUrlIndex + 1}时出错:`, error);
								currentUrlIndex++;
								tryPlayUrl();
							}
						};
						
						tryPlayUrl();
					} else {
						if (onError) onError('当前环境不支持语音播放');
					}
				}
			};
		} catch (error) {
			console.error('创建TTS播放器失败:', error);
			return {
				success: false,
				error: error.message
			};
		}
	}
}

// 创建单例实例
const baiduTranslate = new BaiduTranslateAPI();

export default baiduTranslate;