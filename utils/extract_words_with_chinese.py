import re
import json

input_path = 'c:/Users/86185/Desktop/英语/English/utils/11.json'
output_path = 'c:/Users/86185/Desktop/英语/English/utils/words_with_chinese.json'

words = []

with open(input_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('共') or line.startswith('第 '):
            continue
        match = re.match(r'^([A-Za-z\-]+)\s+(.+)$', line)
        if match:
            word = match.group(1).lower()
            chinese = match.group(2)
            words.append({"word": word, "chinese": chinese})

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(words, f, ensure_ascii=False, indent=2)