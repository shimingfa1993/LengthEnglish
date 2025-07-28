# -*- coding: utf-8 -*-
import json
import re
from collections import defaultdict

print("开始按词性分类单词...")

try:
    # 读取按长度分类的单词文件
    with open('words_by_length.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"成功读取文件，包含 {sum(len(words) for words in data.values())} 个单词")
    
    # 词性分类字典
    pos_categories = {
        'nouns': [],           # 名词
        'verbs': [],           # 动词
        'adjectives': [],      # 形容词
        'adverbs': [],         # 副词
        'pronouns': [],        # 代词
        'prepositions': [],    # 介词
        'conjunctions': [],    # 连词
        'interjections': [],   # 感叹词
        'articles': [],        # 冠词
        'numerals': [],        # 数词
        'auxiliaries': [],     # 助动词
        'others': []           # 其他
    }
    
    # 词性标识映射
    pos_mapping = {
        'n.': 'nouns',
        'v.': 'verbs', 
        'vt.': 'verbs',
        'vi.': 'verbs',
        'a.': 'adjectives',
        'ad.': 'adverbs',
        'adv.': 'adverbs',
        'pron.': 'pronouns',
        'prep.': 'prepositions',
        'conj.': 'conjunctions',
        'interj.': 'interjections',
        'art.': 'articles',
        'num.': 'numerals',
        'aux.': 'auxiliaries'
    }
    
    # 统计计数器
    pos_counts = defaultdict(int)
    total_processed = 0
    
    # 遍历所有单词
    for length, words in data.items():
        for word_info in words:
            word = word_info['word']
            chinese = word_info['chinese']
            total_processed += 1
            
            # 提取词性标识
            pos_found = False
            for pos_tag, category in pos_mapping.items():
                if chinese.startswith(pos_tag):
                    pos_categories[category].append({
                        'word': word,
                        'chinese': chinese,
                        'length': int(length)
                    })
                    pos_counts[category] += 1
                    pos_found = True
                    break
            
            # 如果没有找到明确的词性标识，归类为其他
            if not pos_found:
                pos_categories['others'].append({
                    'word': word,
                    'chinese': chinese,
                    'length': int(length)
                })
                pos_counts['others'] += 1
    
    # 进一步细分动词和名词的语法功能
    grammar_categories = {
        'subject_words': [],      # 可作主语的词（主要是名词、代词）
        'predicate_verbs': [],    # 谓语动词
        'object_words': [],       # 可作宾语的词（名词、代词）
        'transitive_verbs': [],   # 及物动词
        'intransitive_verbs': [], # 不及物动词
        'linking_verbs': [],      # 系动词
        'modal_verbs': []         # 情态动词
    }
    
    # 分析动词类型
    for verb_info in pos_categories['verbs']:
        chinese = verb_info['chinese']
        
        if chinese.startswith('vt.'):
            grammar_categories['transitive_verbs'].append(verb_info)
            grammar_categories['predicate_verbs'].append(verb_info)
        elif chinese.startswith('vi.'):
            grammar_categories['intransitive_verbs'].append(verb_info)
            grammar_categories['predicate_verbs'].append(verb_info)
        elif 'aux.' in chinese or '助动词' in chinese:
            grammar_categories['modal_verbs'].append(verb_info)
        elif verb_info['word'] in ['be', 'is', 'am', 'are', 'was', 'were', 'become', 'seem', 'look', 'feel']:
            grammar_categories['linking_verbs'].append(verb_info)
        else:
            grammar_categories['predicate_verbs'].append(verb_info)
    
    # 分析名词和代词（可作主语和宾语）
    for noun_info in pos_categories['nouns']:
        grammar_categories['subject_words'].append(noun_info)
        grammar_categories['object_words'].append(noun_info)
    
    for pronoun_info in pos_categories['pronouns']:
        grammar_categories['subject_words'].append(pronoun_info)
        grammar_categories['object_words'].append(pronoun_info)
    
    # 创建最终的分类结果
    final_result = {
        'by_part_of_speech': {
            '名词_nouns': sorted(pos_categories['nouns'], key=lambda x: x['word']),
            '动词_verbs': sorted(pos_categories['verbs'], key=lambda x: x['word']),
            '形容词_adjectives': sorted(pos_categories['adjectives'], key=lambda x: x['word']),
            '副词_adverbs': sorted(pos_categories['adverbs'], key=lambda x: x['word']),
            '代词_pronouns': sorted(pos_categories['pronouns'], key=lambda x: x['word']),
            '介词_prepositions': sorted(pos_categories['prepositions'], key=lambda x: x['word']),
            '连词_conjunctions': sorted(pos_categories['conjunctions'], key=lambda x: x['word']),
            '感叹词_interjections': sorted(pos_categories['interjections'], key=lambda x: x['word']),
            '冠词_articles': sorted(pos_categories['articles'], key=lambda x: x['word']),
            '数词_numerals': sorted(pos_categories['numerals'], key=lambda x: x['word']),
            '助动词_auxiliaries': sorted(pos_categories['auxiliaries'], key=lambda x: x['word']),
            '其他_others': sorted(pos_categories['others'], key=lambda x: x['word'])
        },
        'by_grammar_function': {
            '可作主语_subject_words': sorted(grammar_categories['subject_words'], key=lambda x: x['word']),
            '谓语动词_predicate_verbs': sorted(grammar_categories['predicate_verbs'], key=lambda x: x['word']),
            '可作宾语_object_words': sorted(grammar_categories['object_words'], key=lambda x: x['word']),
            '及物动词_transitive_verbs': sorted(grammar_categories['transitive_verbs'], key=lambda x: x['word']),
            '不及物动词_intransitive_verbs': sorted(grammar_categories['intransitive_verbs'], key=lambda x: x['word']),
            '系动词_linking_verbs': sorted(grammar_categories['linking_verbs'], key=lambda x: x['word']),
            '情态动词_modal_verbs': sorted(grammar_categories['modal_verbs'], key=lambda x: x['word'])
        },
        'statistics': {
            'total_words': total_processed,
            'part_of_speech_counts': dict(pos_counts),
            'grammar_function_counts': {
                'subject_words': len(grammar_categories['subject_words']),
                'predicate_verbs': len(grammar_categories['predicate_verbs']),
                'object_words': len(grammar_categories['object_words']),
                'transitive_verbs': len(grammar_categories['transitive_verbs']),
                'intransitive_verbs': len(grammar_categories['intransitive_verbs']),
                'linking_verbs': len(grammar_categories['linking_verbs']),
                'modal_verbs': len(grammar_categories['modal_verbs'])
            }
        }
    }
    
    # 保存结果
    with open('words_by_pos_and_grammar.json', 'w', encoding='utf-8') as f:
        json.dump(final_result, f, ensure_ascii=False, indent=2)
    
    print("\n=== 词性分类统计 ===")
    for pos, count in pos_counts.items():
        chinese_name = {
            'nouns': '名词',
            'verbs': '动词', 
            'adjectives': '形容词',
            'adverbs': '副词',
            'pronouns': '代词',
            'prepositions': '介词',
            'conjunctions': '连词',
            'interjections': '感叹词',
            'articles': '冠词',
            'numerals': '数词',
            'auxiliaries': '助动词',
            'others': '其他'
        }.get(pos, pos)
        print(f"{chinese_name}: {count} 个")
    
    print("\n=== 语法功能分类统计 ===")
    for func, count in final_result['statistics']['grammar_function_counts'].items():
        chinese_name = {
            'subject_words': '可作主语',
            'predicate_verbs': '谓语动词',
            'object_words': '可作宾语',
            'transitive_verbs': '及物动词',
            'intransitive_verbs': '不及物动词',
            'linking_verbs': '系动词',
            'modal_verbs': '情态动词'
        }.get(func, func)
        print(f"{chinese_name}: {count} 个")
    
    print(f"\n✅ 分类完成！结果已保存到 words_by_pos_and_grammar.json")
    print(f"总共处理了 {total_processed} 个单词")
    
except Exception as e:
    print(f"❌ 发生错误: {e}")
    import traceback
    traceback.print_exc()

print("脚本执行完成")
input("按回车键退出...")