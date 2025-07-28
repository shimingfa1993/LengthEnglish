print("脚本开始运行...")

try:
    import json
    print("✅ json 模块导入成功")
    
    import os
    print("✅ os 模块导入成功")
    
    print(f"当前工作目录: {os.getcwd()}")
    
    # 列出当前目录文件
    files = os.listdir('.')
    print(f"当前目录文件数量: {len(files)}")
    
    # 检查目标文件
    if 'words_with_chinese.json' in files:
        print("✅ 找到 words_with_chinese.json")
        
        # 尝试读取文件
        with open('words_with_chinese.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ 成功读取文件，包含 {len(data)} 个条目")
        
        # 创建一个简单的测试输出
        test_output = {
            "1": [{"word": "a", "chinese": "测试"}],
            "test": "success"
        }
        
        with open('test_output.json', 'w', encoding='utf-8') as f:
            json.dump(test_output, f, ensure_ascii=False, indent=2)
        
        print("✅ 测试文件创建成功")
        
    else:
        print("❌ 未找到 words_with_chinese.json")
        print("目录中的文件:")
        for f in files:
            print(f"  - {f}")
            
except Exception as e:
    print(f"❌ 发生错误: {e}")
    import traceback
    traceback.print_exc()

print("脚本执行完成")
input("按回车键退出...")