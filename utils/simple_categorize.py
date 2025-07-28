import json
import os

print("=== 开始单词分类脚本 ===")

try:
    # 使用相对路径
    input_file = 'words_with_chinese.json'
    output_file = 'words_by_length.json'
    
    print(f"当前工作目录: {os.getcwd()}")
    print(f"查找输入文件: {input_file}")
    
    # 检查文件是否存在
    if not os.path.exists(input_file):
        print(f"错误：找不到文件 {input_file}")
        print("当前目录下的文件：")
        for f in os.listdir('.'):
            print(f"  - {f}")
        exit(1)
    
    print("✅ 找到输入文件，开始读取...")
    
    # 读取数据
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ 成功读取 {len(data)} 个单词")
    
    # 按长度分类
    result = {}
    
    for item in data:
        word = item['word']
        chinese = item['chinese']
        length = len(word)
        
        if str(length) not in result:
            result[str(length)] = []
        
        result[str(length)].append({
            'word': word,
            'chinese': chinese
        })
    
    # 排序
    for length_key in result:
        result[length_key].sort(key=lambda x: x['word'])
    
    print("✅ 分类完成，开始保存...")
    
    # 保存文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功保存到 {output_file}")
    
    # 显示统计
    print("\n📊 分类统计：")
    for length in sorted(result.keys(), key=int):
        count = len(result[length])
        print(f"  {length} 个字母: {count} 个单词")
    
    print(f"\n🎉 总共分为 {len(result)} 个长度类别")
    
except Exception as e:
    print(f"❌ 发生错误: {str(e)}")
    import traceback
    print("详细错误信息：")
    traceback.print_exc()

print("\n脚本执行完成！")