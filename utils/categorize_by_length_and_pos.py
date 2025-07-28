# -*- coding: utf-8 -*-
import json
from collections import defaultdict

print("开始在单词长度基础上按词性细分...")

try:
    # 读取按长度分类的单词文件
    with open('words_by_length.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"成功读取文件，包含 {sum(len(words) for words in data.values())} 个单词")
    
    # 词性标识映射
    pos_mapping = {
        'n.': '名词_nouns',
        'v.': '动词_verbs', 
        'vt.': '动词_verbs',
        'vi.': '动词_verbs',
        'a.': '形容词_adjectives',
        'ad.': '副词_adverbs',
        'adv.': '副词_adverbs',
        'pron.': '代词_pronouns',
        'prep.': '介词_prepositions',
        'conj.': '连词_conjunctions',
        'interj.': '感叹词_interjections',
        'art.': '冠词_articles',
        'num.': '数词_numerals',
        'aux.': '助动词_auxiliaries'
    }
    
    # 创建新的分类结构
    result = {}
    
    # 遍历每个长度分组
    for length, words in data.items():
        print(f"处理长度为 {length} 的单词...")
        
        # 为当前长度创建词性分组
        length_pos_groups = defaultdict(list)
        
        # 遍历当前长度的所有单词
        for word_info in words:
            word = word_info['word']
            chinese = word_info['chinese']
            
            # 确定词性
            pos_category = '其他_others'  # 默认分类
            
            for pos_tag, category in pos_mapping.items():
                if chinese.startswith(pos_tag):
                    pos_category = category
                    break
            
            # 添加到对应的词性分组
            length_pos_groups[pos_category].append({
                'word': word,
                'chinese': chinese
            })
        
        # 对每个词性分组内的单词按字母顺序排序
        for pos_category in length_pos_groups:
            length_pos_groups[pos_category].sort(key=lambda x: x['word'])
        
        # 将结果添加到最终结构中
        result[length] = dict(length_pos_groups)
        
        # 显示当前长度的统计信息
        total_words = len(words)
        pos_counts = {pos: len(words_list) for pos, words_list in length_pos_groups.items()}
        print(f"  长度 {length}: 总共 {total_words} 个单词")
        for pos, count in pos_counts.items():
            print(f"    {pos}: {count} 个")
    
    # 保存结果
    with open('words_by_length_and_pos.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print("\n=== 总体统计 ===")
    total_words = 0
    all_pos_counts = defaultdict(int)
    
    for length, pos_groups in result.items():
        length_total = sum(len(words) for words in pos_groups.values())
        total_words += length_total
        print(f"长度 {length}: {length_total} 个单词")
        
        for pos, words in pos_groups.items():
            all_pos_counts[pos] += len(words)
    
    print(f"\n=== 各词性总计 ===")
    for pos, count in sorted(all_pos_counts.items()):
        print(f"{pos}: {count} 个")
    
    print(f"\n✅ 分类完成！结果已保存到 words_by_length_and_pos.json")
    print(f"总共处理了 {total_words} 个单词")
    
except Exception as e:
    print(f"❌ 发生错误: {e}")
    import traceback
    traceback.print_exc()

print("脚本执行完成")
input("按回车键退出...")