import json
from collections import defaultdict

# 输入和输出文件路径
input_path = 'c:/Users/86185/Desktop/英语/English/utils/words_with_chinese.json'
output_path = 'c:/Users/86185/Desktop/英语/English/utils/words_by_length.json'

print("开始处理单词分类...")

# 读取原始数据
with open(input_path, 'r', encoding='utf-8') as f:
    words_data = json.load(f)

print(f"总共读取到 {len(words_data)} 个单词")

# 按长度分类
words_by_length = defaultdict(list)
length_stats = defaultdict(int)

for item in words_data:
    word = item['word']
    chinese = item['chinese']
    word_length = len(word)
    
    words_by_length[word_length].append({
        'word': word,
        'chinese': chinese
    })
    length_stats[word_length] += 1

# 转换为普通字典并排序
result = {}
for length in sorted(words_by_length.keys()):
    result[str(length)] = sorted(words_by_length[length], key=lambda x: x['word'])

print("\n按长度分类统计：")
for length in sorted(length_stats.keys()):
    print(f"{length} 个字母: {length_stats[length]} 个单词")

# 保存结果
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"\n分类完成！结果已保存到: {output_path}")
print(f"共分为 {len(result)} 个长度类别")