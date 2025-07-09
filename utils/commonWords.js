// 常用单词库 - 按长度分类的高频词汇
// 涵盖日常工作学习和考研常用词汇
// 基于考研英语大纲、历年真题高频词汇、学术写作词汇等权威资源

const commonWordsByLength = {
	// 1字母单词
	1: ['I', 'a'],
	
	// 2字母单词  
	2: ['is', 'it', 'be', 'to', 'of', 'in', 'do', 'go', 'we', 'me', 'my', 'so', 'no', 'up', 'on', 'at', 'by', 'if', 'or', 'he', 'as', 'an', 'am'],
	
	// 3字母单词
	3: [
		'the', 'and', 'you', 'are', 'for', 'not', 'can', 'get', 'all', 'new', 'way', 'may', 'say', 'use', 'her', 'she', 'how',
		'see', 'now', 'two', 'day', 'man', 'old', 'try', 'any', 'ask', 'put', 'end', 'run', 'big', 'let', 'why', 'own',
		'eat', 'job', 'yet', 'age', 'buy', 'sit', 'hit', 'cut', 'eye', 'win', 'top', 'car', 'set', 'red', 'lot', 'boy',
		'add', 'act', 'air', 'art', 'bad', 'ban', 'bar', 'bat', 'bed', 'bet', 'bid', 'bit', 'box', 'bus', 'but', 'cap',
		'cat', 'cop', 'cup', 'dad', 'die', 'dig', 'dog', 'dot', 'due', 'ear', 'egg', 'era', 'eve', 'far', 'fat', 'few',
		'fig', 'fit', 'fix', 'fly', 'fun', 'gap', 'gas', 'gun', 'guy', 'hat', 'her', 'hip', 'hot', 'ice', 'ill', 'ion',
		'its', 'key', 'kid', 'lab', 'law', 'lay', 'leg', 'lie', 'lip', 'log', 'mad', 'map', 'mix', 'mom', 'net', 'odd',
		'off', 'oil', 'our', 'out', 'pan', 'pay', 'pen', 'pet', 'pie', 'pig', 'pin', 'pop', 'pot', 'raw', 'rid', 'row',
		'sad', 'sea', 'sex', 'she', 'shy', 'sin', 'sir', 'six', 'sky', 'son', 'sun', 'tag', 'tax', 'tea', 'ten', 'tie',
		'tip', 'toe', 'too', 'toy', 'war', 'was', 'who', 'why', 'win', 'yes', 'zip'
	],
	
	// 4字母单词
	4: [
		'that', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very',
		'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were',
		'what', 'year', 'work', 'also', 'back', 'call', 'came', 'each', 'even', 'find', 'give', 'hand', 'help', 'high', 'keep',
		'kind', 'last', 'left', 'life', 'live', 'look', 'move', 'must', 'name', 'need', 'next', 'only', 'open', 'part', 'play',
		'read', 'real', 'seem', 'show', 'talk', 'tell', 'turn', 'used', 'want', 'week', 'went', 'word', 'book', 'case', 'data',
		'fact', 'game', 'home', 'idea', 'lead', 'line', 'mind', 'plan', 'role', 'room', 'said', 'task', 'team', 'text', 'view',
		// 考研英语高频4字母单词
		'able', 'acid', 'aged', 'aids', 'area', 'army', 'baby', 'bank', 'base', 'bear', 'beat', 'beer', 'bell', 'belt', 'bend',
		'best', 'bike', 'bill', 'bind', 'bird', 'bite', 'blow', 'blue', 'boat', 'body', 'bone', 'born', 'both', 'bowl', 'burn',
		'busy', 'card', 'care', 'cash', 'cast', 'cell', 'chat', 'chef', 'chin', 'chip', 'city', 'clip', 'club', 'coal', 'coat',
		'code', 'coin', 'cold', 'cool', 'copy', 'corn', 'cost', 'crew', 'crop', 'cube', 'cure', 'cute', 'damn', 'dare', 'dark',
		'date', 'dawn', 'dead', 'deal', 'dear', 'debt', 'deck', 'deep', 'deny', 'desk', 'dial', 'died', 'diet', 'dirt', 'dish',
		'dive', 'dock', 'done', 'door', 'dose', 'down', 'draw', 'drew', 'drop', 'drug', 'dual', 'duck', 'dump', 'dust', 'duty',
		'each', 'earn', 'ease', 'east', 'echo', 'edge', 'edit', 'else', 'emit', 'epic', 'even', 'evil', 'exam', 'exit', 'face',
		'fail', 'fair', 'fall', 'fame', 'farm', 'fast', 'fate', 'fear', 'feel', 'feet', 'fell', 'felt', 'file', 'fill', 'film',
		'fine', 'fire', 'firm', 'fish', 'fist', 'five', 'flag', 'flat', 'flee', 'flew', 'flip', 'flow', 'folk', 'fond', 'food',
		'fool', 'foot', 'fork', 'form', 'fort', 'four', 'free', 'fuel', 'full', 'fund', 'gain', 'gate', 'gave', 'gear', 'gene',
		'gift', 'girl', 'glad', 'goal', 'goat', 'gold', 'golf', 'gone', 'gray', 'grew', 'grid', 'grow', 'gulf', 'half', 'hall',
		'hang', 'hard', 'harm', 'hate', 'head', 'heal', 'hear', 'heat', 'held', 'hell', 'hide', 'hill', 'hint', 'hire', 'hit',
		'hold', 'hole', 'holy', 'hook', 'hope', 'horn', 'host', 'hour', 'huge', 'hunt', 'hurt', 'icon', 'inch', 'iron', 'item',
		'join', 'joke', 'jump', 'june', 'jury', 'keep', 'kent', 'kick', 'kill', 'king', 'kiss', 'knee', 'knew', 'knot', 'laid',
		'lake', 'lamp', 'land', 'lane', 'late', 'lean', 'leap', 'left', 'lens', 'lent', 'lied', 'lift', 'link', 'lion', 'list',
		'load', 'loan', 'lock', 'logo', 'lone', 'loop', 'lord', 'lose', 'loss', 'lost', 'loud', 'love', 'luck', 'luna', 'lung',
		'made', 'mail', 'main', 'male', 'mall', 'mare', 'mark', 'mars', 'mask', 'mass', 'mate', 'math', 'meal', 'mean', 'meat',
		'meet', 'melt', 'memo', 'mice', 'mild', 'mile', 'milk', 'mill', 'mine', 'mint', 'miss', 'mode', 'mood', 'moon', 'more',
		'most', 'myth', 'nail', 'near', 'neck', 'nest', 'news', 'nice', 'nick', 'nine', 'node', 'none', 'noon', 'norm', 'nose',
		'note', 'noun', 'nude', 'nuts', 'oath', 'once', 'onto', 'oral', 'oval', 'pace', 'pack', 'page', 'paid', 'pain', 'pair',
		'pale', 'palm', 'park', 'pass', 'past', 'path', 'peak', 'peer', 'pick', 'pile', 'pill', 'pine', 'pink', 'pipe', 'plan',
		'plot', 'plug', 'plus', 'poem', 'poet', 'poll', 'pool', 'poor', 'port', 'pose', 'post', 'pull', 'pump', 'pure', 'push',
		'quit', 'race', 'rage', 'rail', 'rain', 'rank', 'rare', 'rate', 'rays', 'rice', 'rich', 'ride', 'ring', 'rise', 'risk',
		'road', 'rock', 'rode', 'role', 'roll', 'roof', 'root', 'rope', 'rose', 'rude', 'rule', 'runs', 'rush', 'safe', 'sail',
		'sake', 'sale', 'salt', 'same', 'sand', 'save', 'scan', 'seal', 'seat', 'seed', 'seek', 'self', 'sell', 'send', 'sent',
		'sept', 'ship', 'shoe', 'shop', 'shot', 'shut', 'sick', 'side', 'sign', 'silk', 'sing', 'sink', 'site', 'size', 'skin',
		'skip', 'slip', 'slow', 'snap', 'snow', 'soap', 'sock', 'soft', 'soil', 'sold', 'sole', 'song', 'soon', 'sort', 'soul',
		'soup', 'spin', 'spot', 'star', 'stay', 'step', 'stop', 'suit', 'sure', 'swim', 'tail', 'tall', 'tank', 'tape', 'tear',
		'tend', 'tent', 'term', 'test', 'text', 'than', 'thin', 'tick', 'tide', 'tied', 'tile', 'tiny', 'tire', 'told', 'tone',
		'took', 'tool', 'tops', 'tour', 'town', 'tree', 'trip', 'true', 'tube', 'tune', 'twin', 'type', 'unit', 'upon', 'used',
		'user', 'vary', 'vast', 'verb', 'vice', 'vote', 'wage', 'wait', 'wake', 'walk', 'wall', 'ward', 'warm', 'warn', 'wash',
		'wave', 'ways', 'weak', 'wear', 'week', 'well', 'west', 'what', 'wide', 'wife', 'wild', 'wind', 'wine', 'wing', 'wire',
		'wise', 'wish', 'with', 'wolf', 'wood', 'wool', 'wore', 'zero', 'zone'
	],
	
	// 5字母单词
	5: [
		'about', 'after', 'again', 'being', 'could', 'every', 'first', 'great', 'group', 'house', 'large', 'local', 'might',
		'never', 'often', 'other', 'place', 'point', 'right', 'shall', 'small', 'start', 'still', 'their', 'there', 'these',
		'thing', 'think', 'three', 'under', 'water', 'where', 'which', 'while', 'would', 'write', 'young', 'above', 'again',
		'alone', 'among', 'basic', 'begin', 'bring', 'build', 'carry', 'chair', 'child', 'clear', 'close', 'early', 'every',
		'focus', 'front', 'given', 'green', 'heart', 'hours', 'human', 'image', 'issue', 'learn', 'leave', 'level', 'light',
		'money', 'music', 'order', 'paper', 'party', 'phone', 'piece', 'place', 'plant', 'power', 'quick', 'quite', 'radio',
		'reach', 'sales', 'scene', 'sense', 'serve', 'share', 'short', 'sound', 'space', 'speak', 'speed', 'spend', 'staff',
		'stage', 'state', 'stock', 'story', 'style', 'table', 'teach', 'third', 'title', 'total', 'touch', 'track', 'trade',
		'train', 'treat', 'trend', 'trial', 'truly', 'trust', 'truth', 'union', 'unity', 'urban', 'using', 'value', 'video',
		'visit', 'voice', 'waste', 'watch', 'white', 'whole', 'world', 'worth', 'youth',
		// 考研英语高频5字母单词
		'abuse', 'acute', 'adapt', 'admit', 'adopt', 'adult', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alien',
		'align', 'alike', 'alive', 'allow', 'alter', 'angel', 'anger', 'angle', 'angry', 'ankle', 'apply', 'arena', 'argue',
		'arise', 'armed', 'armor', 'array', 'arrow', 'aside', 'asset', 'atlas', 'avoid', 'awake', 'award', 'aware', 'badly',
		'badge', 'basic', 'batch', 'beach', 'beard', 'beast', 'bench', 'bible', 'bikes', 'birth', 'black', 'blade', 'blame',
		'blank', 'blast', 'bleed', 'blend', 'bless', 'blind', 'block', 'blood', 'bloom', 'board', 'boost', 'booth', 'bound',
		'brain', 'brand', 'brass', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief', 'bring', 'broad', 'broke',
		'brown', 'brush', 'buddy', 'build', 'built', 'bunch', 'burst', 'buyer', 'cable', 'cache', 'candy', 'canoe', 'cards',
		'cargo', 'catch', 'cause', 'chain', 'chaos', 'charm', 'chart', 'chase', 'cheap', 'cheat', 'check', 'chest', 'chief',
		'china', 'choir', 'chose', 'chunk', 'claim', 'clash', 'class', 'clean', 'clear', 'click', 'climb', 'clock', 'close',
		'cloth', 'cloud', 'coach', 'coast', 'coins', 'color', 'comet', 'comic', 'coral', 'costs', 'count', 'court', 'cover',
		'crack', 'craft', 'crash', 'crazy', 'cream', 'creek', 'crime', 'crisp', 'cross', 'crowd', 'crown', 'crude', 'cruel',
		'crush', 'curve', 'cycle', 'daily', 'dance', 'dated', 'dealt', 'death', 'debut', 'delay', 'delta', 'dense', 'depth',
		'devil', 'diary', 'dirty', 'disco', 'doing', 'doubt', 'dozen', 'draft', 'drama', 'drank', 'dream', 'dress', 'dried',
		'drill', 'drink', 'drive', 'drove', 'drunk', 'dying', 'eager', 'eagle', 'earth', 'eight', 'elder', 'elect', 'elite',
		'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'essay', 'event', 'exact', 'exams', 'exist', 'extra',
		'faced', 'facts', 'faith', 'false', 'fancy', 'fatal', 'fault', 'favor', 'fence', 'fever', 'fiber', 'field', 'fifty',
		'fight', 'final', 'fixed', 'flags', 'flame', 'flash', 'fleet', 'flesh', 'float', 'flood', 'floor', 'flour', 'flows',
		'fluid', 'folks', 'force', 'forms', 'forth', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'frost', 'fruit',
		'funny', 'gifts', 'girls', 'glass', 'globe', 'glory', 'glove', 'goals', 'grace', 'grade', 'grain', 'grand', 'grant',
		'graph', 'grass', 'grave', 'great', 'greed', 'grief', 'grill', 'gross', 'grown', 'guard', 'guess', 'guest', 'guide',
		'guilt', 'hands', 'happy', 'harsh', 'haste', 'haven', 'heads', 'heard', 'heavy', 'hence', 'herbs', 'hills', 'hired',
		'hobby', 'holds', 'honey', 'honor', 'hooks', 'hoped', 'horse', 'hotel', 'hound', 'hover', 'humor', 'hurry', 'ideal',
		'ideas', 'idiom', 'image', 'imply', 'inbox', 'index', 'indie', 'inner', 'input', 'ivory', 'japan', 'jeans', 'jewel',
		'joint', 'jokes', 'judge', 'juice', 'kicks', 'kills', 'kinds', 'kings', 'knife', 'knock', 'known', 'label', 'labor',
		'lacks', 'lakes', 'lands', 'large', 'laser', 'later', 'laugh', 'layer', 'leads', 'leaks', 'lease', 'least', 'legal',
		'lemon', 'level', 'libel', 'light', 'liked', 'likes', 'limit', 'lines', 'links', 'lists', 'lived', 'liver', 'lives',
		'loads', 'loans', 'lobby', 'local', 'locks', 'logic', 'looks', 'loops', 'loose', 'lords', 'loses', 'loved', 'lover',
		'loves', 'lower', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'makes', 'males', 'maple', 'march', 'marks',
		'marry', 'match', 'maybe', 'mayor', 'meals', 'means', 'meant', 'medal', 'media', 'meets', 'melon', 'menus', 'mercy',
		'merit', 'metal', 'meter', 'metro', 'might', 'miles', 'mills', 'minds', 'mines', 'minor', 'minus', 'mixed', 'modal',
		'model', 'modes', 'moist', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'moved', 'moves', 'movie', 'names', 'needs',
		'nerve', 'night', 'noise', 'north', 'noted', 'notes', 'novel', 'nurse', 'ocean', 'offer', 'opens', 'opted', 'organ',
		'other', 'outer', 'owned', 'owner', 'pages', 'paint', 'pairs', 'panel', 'panic', 'pants', 'parks', 'parts', 'party',
		'pasta', 'patch', 'paths', 'pause', 'peace', 'pearl', 'peers', 'phase', 'phone', 'photo', 'piano', 'picks', 'piece',
		'pilot', 'pipes', 'pitch', 'pizza', 'plain', 'plans', 'plate', 'plays', 'plaza', 'plots', 'poems', 'poets', 'poker',
		'polar', 'polls', 'pools', 'ports', 'posts', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior',
		'prize', 'proof', 'props', 'proud', 'prove', 'proxy', 'pulls', 'pulse', 'pumps', 'pupil', 'purse', 'queen', 'query',
		'quest', 'queue', 'quiet', 'quite', 'quota', 'quote', 'radio', 'raise', 'ranks', 'rapid', 'rates', 'ratio', 'reach',
		'reads', 'ready', 'realm', 'rebel', 'refer', 'relax', 'relay', 'remix', 'reply', 'rider', 'rides', 'ridge', 'rings',
		'risks', 'rival', 'river', 'roads', 'robot', 'rocks', 'roles', 'rolls', 'roman', 'rooms', 'roots', 'roses', 'rough',
		'round', 'route', 'royal', 'rugby', 'ruins', 'rules', 'rural', 'sadly', 'safer', 'saint', 'salad', 'sales', 'salon',
		'sandy', 'sauce', 'saved', 'saves', 'scale', 'scary', 'scene', 'scope', 'score', 'scots', 'scout', 'seats', 'seeds',
		'seems', 'sells', 'sends', 'sense', 'serve', 'seven', 'shade', 'shake', 'shall', 'shame', 'shape', 'share', 'shark',
		'sharp', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shirt', 'shock', 'shoes', 'shoot', 'shops', 'shore', 'shown',
		'shows', 'shrug', 'sided', 'sides', 'sight', 'signs', 'silly', 'since', 'sixth', 'sized', 'sizes', 'skill', 'slept',
		'slide', 'slope', 'slots', 'slump', 'small', 'smart', 'smile', 'smoke', 'snake', 'snaps', 'sneak', 'snowy', 'socks',
		'solar', 'solid', 'solve', 'songs', 'sonic', 'sorry', 'sorts', 'souls', 'sound', 'south', 'spare', 'spark', 'speak',
		'specs', 'speed', 'spell', 'spend', 'spent', 'spice', 'spine', 'split', 'spoke', 'sport', 'spots', 'spray', 'squad',
		'stack', 'staff', 'stage', 'stair', 'stake', 'stamp', 'stand', 'stare', 'stars', 'start', 'state', 'stays', 'steam',
		'steel', 'steep', 'steps', 'stick', 'still', 'sting', 'stock', 'stone', 'stood', 'store', 'storm', 'story', 'strip',
		'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'swear', 'sweet', 'swept', 'swift', 'swing', 'swiss',
		'sword', 'table', 'taken', 'takes', 'tales', 'talks', 'tanks', 'tapes', 'tasks', 'taste', 'taxes', 'teach', 'teams',
		'tears', 'teens', 'teeth', 'tells', 'tends', 'tents', 'terms', 'tests', 'texts', 'thank', 'theft', 'theme', 'there',
		'these', 'thick', 'thing', 'think', 'third', 'those', 'threw', 'throw', 'thumb', 'tidal', 'tiger', 'tight', 'tiles',
		'times', 'tired', 'toast', 'today', 'token', 'tools', 'tooth', 'topic', 'total', 'touch', 'tough', 'tower', 'towns',
		'toxic', 'track', 'trade', 'trail', 'train', 'trait', 'trash', 'treat', 'trees', 'trend', 'trial', 'tribe', 'trick',
		'tried', 'tries', 'trips', 'truck', 'truly', 'trump', 'trunk', 'trust', 'truth', 'tubes', 'tuned', 'turns', 'twist',
		'typed', 'types', 'ultra', 'uncle', 'under', 'union', 'units', 'unity', 'until', 'upper', 'upset', 'urban', 'urged',
		'usage', 'users', 'using', 'usual', 'value', 'venue', 'video', 'views', 'virus', 'visit', 'vital', 'vocal', 'voice',
		'voted', 'votes', 'wages', 'waist', 'waits', 'walks', 'walls', 'wants', 'waste', 'watch', 'water', 'waves', 'wealth',
		'weird', 'wheel', 'where', 'which', 'while', 'white', 'whole', 'whose', 'wider', 'wilde', 'winds', 'wines', 'wings',
		'wipes', 'wired', 'wires', 'witch', 'women', 'woods', 'words', 'works', 'world', 'worry', 'worse', 'worst', 'worth',
		'would', 'wound', 'write', 'wrote', 'yards', 'years', 'yield', 'young', 'yours', 'youth', 'zones'
	],
	
	// 6字母单词
	6: [
		'always', 'around', 'because', 'before', 'change', 'differ', 'during', 'enough', 'family', 'follow', 'friend', 'growth',
		'happen', 'having', 'health', 'higher', 'income', 'itself', 'little', 'living', 'making', 'market', 'matter', 'member',
		'moment', 'mother', 'moving', 'nation', 'nature', 'number', 'office', 'others', 'people', 'person', 'policy', 'public',
		'rather', 'really', 'reason', 'recent', 'record', 'result', 'return', 'school', 'second', 'should', 'simple', 'social',
		'speech', 'street', 'strong', 'system', 'though', 'though', 'toward', 'travel', 'trying', 'turned', 'twenty', 'update',
		'useful', 'visual', 'wanted', 'within', 'wonder', 'worked', 'accept', 'access', 'across', 'action', 'agency', 'amount',
		'animal', 'answer', 'appear', 'around', 'attack', 'author', 'battle', 'better', 'beyond', 'border', 'bottle', 'branch',
		'breast', 'breath', 'bridge', 'bright', 'broken', 'budget', 'button', 'camera', 'campus', 'cancer', 'carbon', 'career',
		'center', 'centre', 'choice', 'church', 'circle', 'client', 'closed', 'closer', 'club', 'coffee', 'common', 'couple',
		'course', 'create', 'credit', 'crisis', 'custom', 'danger', 'dealer', 'debate', 'decade', 'decide', 'degree', 'demand',
		'deputy', 'design', 'detail', 'device', 'dinner', 'direct', 'doctor', 'double', 'driver', 'during', 'easily', 'eating',
		'effect', 'effort', 'either', 'eleven', 'energy', 'engage', 'engine', 'entire', 'escape', 'estate', 'ethnic', 'europe',
		'events', 'except', 'expert', 'extend', 'fabric', 'factor', 'failed', 'fairly', 'father', 'fellow', 'female', 'figure',
		'finger', 'finish', 'flight', 'flower', 'forest', 'forget', 'formal', 'format', 'former', 'fourth', 'french', 'future',
		'garden', 'gather', 'gender', 'german', 'global', 'ground', 'happen', 'hardly', 'health', 'height', 'hidden', 'holder',
		'hoping', 'horror', 'impact', 'income', 'indeed', 'inside', 'insert', 'island', 'itself', 'jacket', 'joseph', 'junior',
		'killed', 'ladies', 'laptop', 'latter', 'launch', 'lawyer', 'leader', 'league', 'length', 'letter', 'listen', 'little',
		'longer', 'luxury', 'making', 'manage', 'manner', 'marble', 'margin', 'marine', 'marked', 'master', 'matter', 'mature',
		'medium', 'memory', 'mental', 'method', 'middle', 'miller', 'minute', 'mirror', 'mobile', 'modern', 'modest', 'modify',
		'module', 'moment', 'monday', 'mostly', 'mother', 'motion', 'murder', 'myself', 'needle', 'needed', 'neural', 'nevada',
		'newest', 'nicely', 'nobody', 'normal', 'notice', 'notion', 'novels', 'number', 'object', 'obtain', 'office', 'online',
		'option', 'orange', 'origin', 'output', 'oxford', 'packed', 'palace', 'panels', 'parade', 'parent', 'partly', 'patent',
		'peace', 'period', 'permit', 'person', 'phrase', 'picked', 'pieces', 'played', 'player', 'please', 'plenty', 'policy',
		'polish', 'portal', 'poster', 'powder', 'praise', 'prayer', 'pretty', 'prince', 'prison', 'profit', 'proper', 'proven',
		'public', 'purple', 'pushed', 'puzzle', 'quotes', 'racing', 'random', 'rarely', 'rather', 'reader', 'really', 'reason',
		'rebels', 'recall', 'recent', 'record', 'reduce', 'reform', 'refuse', 'region', 'relate', 'remain', 'remote', 'remove',
		'repair', 'repeat', 'replay', 'reply', 'report', 'rescue', 'result', 'retail', 'return', 'reveal', 'review', 'reward',
		'riding', 'rising', 'robust', 'rolled', 'rubber', 'rushed', 'sacred', 'safely', 'sample', 'saying', 'scheme', 'school',
		'screen', 'script', 'search', 'season', 'second', 'secret', 'sector', 'select', 'seller', 'senior', 'sensor', 'server',
		'settle', 'severe', 'sexual', 'shadow', 'shared', 'shield', 'should', 'showed', 'shower', 'signal', 'silent', 'silver',
		'simple', 'single', 'sister', 'sketch', 'slight', 'smooth', 'social', 'socket', 'solely', 'solved', 'sorted', 'source',
		'spare', 'spirit', 'spoken', 'spread', 'spring', 'square', 'stable', 'stands', 'status', 'stayed', 'steady', 'stolen',
		'stored', 'strain', 'strand', 'stream', 'street', 'stress', 'strict', 'strike', 'string', 'strong', 'struck', 'studio',
		'stupid', 'submit', 'suburb', 'sudden', 'suffer', 'summer', 'sunday', 'supply', 'surely', 'survey', 'switch', 'symbol',
		'system', 'taking', 'talent', 'target', 'taught', 'temple', 'tender', 'tennis', 'thanks', 'that', 'theory', 'thirty',
		'though', 'thread', 'threat', 'threw', 'thrown', 'ticket', 'timber', 'tissue', 'titles', 'toilet', 'toward', 'trader',
		'travel', 'treaty', 'trying', 'tunnel', 'twelve', 'twenty', 'typing', 'unable', 'unique', 'united', 'unless', 'unlike',
		'update', 'upload', 'useful', 'valley', 'varied', 'vector', 'vendor', 'versus', 'victim', 'viewer', 'virgin', 'vision',
		'visual', 'volume', 'walker', 'warmth', 'wealth', 'weapon', 'weekly', 'weight', 'wholly', 'window', 'winner', 'winter',
		'within', 'wizard', 'woman', 'wonder', 'worked', 'worker', 'wright', 'writer', 'yellow', 'younger'
	],
	
	// 7字母单词
	7: [
		'another', 'because', 'between', 'company', 'control', 'develop', 'example', 'express', 'general', 'however', 'include',
		'instead', 'present', 'problem', 'program', 'provide', 'service', 'several', 'special', 'student', 'support', 'through',
		'without', 'account', 'address', 'advance', 'against', 'already', 'analyse', 'ancient', 'animals', 'another', 'anxiety',
		'anybody', 'anymore', 'applied', 'article', 'attempt', 'attract', 'average', 'backing', 'balance', 'barrier', 'battery',
		'bearing', 'beating', 'bedroom', 'benefit', 'bicycle', 'billion', 'binding', 'biology', 'blanket', 'booking', 'borough',
		'brother', 'brought', 'builder', 'burning', 'cabinet', 'caliber', 'calling', 'capable', 'capital', 'captain', 'capture',
		'cardiac', 'careful', 'carrier', 'catalog', 'ceiling', 'central', 'century', 'certain', 'chamber', 'channel', 'chapter',
		// 考研英语高频7字母单词
		'ability', 'absence', 'academy', 'achieve', 'acquire', 'actions', 'address', 'admirer', 'adviser', 'airport', 'alcohol',
		'allowed', 'amazing', 'ambient', 'analyse', 'analyze', 'antenna', 'anxious', 'anywhere', 'appeals', 'approve', 'arrange',
		'arrival', 'artist', 'assault', 'auction', 'awesome', 'balance', 'bargain', 'battery', 'bedroom', 'blanket', 'borders',
		'briefly', 'browser', 'cabinet', 'cameras', 'capable', 'capital', 'captain', 'careful', 'carried', 'cartoon', 'catalog',
		'ceiling', 'central', 'century', 'certain', 'chamber', 'chances', 'channel', 'chapter', 'charity', 'chicken', 'choices',
		'circuit', 'classic', 'climate', 'closing', 'cluster', 'coastal', 'cocaine', 'collect', 'college', 'combine', 'command',
		'comment', 'commits', 'compact', 'company', 'compare', 'compete', 'complex', 'compute', 'concept', 'concern', 'condemn',
		'conduct', 'confirm', 'connect', 'consent', 'consist', 'consult', 'contact', 'contain', 'content', 'contest', 'context',
		'convert', 'cooking', 'council', 'counter', 'country', 'couples', 'courage', 'creator', 'crystal', 'culture', 'current',
		'custody', 'customs', 'cutting', 'dancing', 'dangers', 'dealing', 'decided', 'declare', 'decline', 'defence', 'deliver',
		'density', 'deposit', 'desktop', 'destroy', 'details', 'devoted', 'diamond', 'digital', 'dinner', 'diploma', 'disable',
		'discuss', 'disease', 'dismiss', 'distant', 'divorce', 'doorway', 'drawing', 'dressed', 'drivers', 'dynamic', 'earlier',
		'eastern', 'ecology', 'economy', 'edition', 'elderly', 'element', 'emperor', 'enabled', 'endless', 'enemies', 'engines',
		'enhance', 'equally', 'evening', 'excited', 'exclude', 'execute', 'exhibit', 'expense', 'explain', 'explore', 'extract',
		'extreme', 'factory', 'faculty', 'failure', 'fantasy', 'fashion', 'feature', 'federal', 'finance', 'finding', 'fitness',
		'foreign', 'forever', 'formula', 'fortune', 'forward', 'freedom', 'gallery', 'genuine', 'grammar', 'greatly', 'grocery',
		'habitat', 'handles', 'harmony', 'heading', 'healthy', 'hearing', 'heating', 'helpers', 'herself', 'highway', 'history',
		'holiday', 'housing', 'husband', 'illness', 'imagine', 'impress', 'improve', 'inflate', 'initial', 'inquiry', 'instant',
		'invited', 'journal', 'journey', 'justice', 'kitchen', 'largely', 'lasting', 'laundry', 'lawsuit', 'leaders', 'learned',
		'leisure', 'letters', 'liberal', 'library', 'license', 'limited', 'machine', 'mailbox', 'manager', 'married', 'massive',
		'matters', 'maximum', 'meaning', 'measure', 'medical', 'meeting', 'members', 'message', 'mineral', 'minimum', 'missing',
		'mission', 'mistake', 'mixture', 'modeling', 'monitor', 'monthly', 'morning', 'musical', 'natural', 'nervous', 'network',
		'neutral', 'nuclear', 'obesity', 'objects', 'obvious', 'october', 'opening', 'operate', 'opinion', 'opposed', 'optical',
		'optimal', 'options', 'organic', 'outline', 'overall', 'package', 'painful', 'parents', 'parking', 'partial', 'parties',
		'passage', 'passion', 'patient', 'pattern', 'payment', 'penalty', 'pending', 'perfect', 'perform', 'perhaps', 'persist',
		'persons', 'picture', 'pioneer', 'plastic', 'popular', 'portion', 'possess', 'poverty', 'precise', 'predict', 'premier',
		'premium', 'prepare', 'present', 'prevent', 'primary', 'printer', 'privacy', 'private', 'probing', 'problem', 'produce',
		'product', 'profile', 'project', 'promise', 'protect', 'protest', 'proudly', 'provide', 'purpose', 'qualify', 'quality',
		'quickly', 'radical', 'readily', 'reality', 'receive', 'recognize', 'reflect', 'regions', 'related', 'release', 'remains',
		'removal', 'replace', 'request', 'require', 'reserve', 'resolve', 'respect', 'respond', 'restore', 'results', 'revenue',
		'reverse', 'revised', 'routine', 'satisfy', 'science', 'scratch', 'section', 'segment', 'serious', 'service', 'session',
		'setting', 'several', 'shelter', 'shortage', 'society', 'somehow', 'speaker', 'special', 'sponsor', 'station', 'storage',
		'strange', 'stretch', 'student', 'studies', 'subject', 'success', 'summary', 'support', 'surface', 'surgery', 'surplus',
		'survive', 'suspect', 'systems', 'talents', 'therapy', 'thought', 'through', 'tonight', 'trading', 'traffic', 'trained',
		'transit', 'treated', 'trouble', 'trusted', 'turning', 'typical', 'uniform', 'unknown', 'unusual', 'utility', 'vaccine',
		'variety', 'vehicle', 'venture', 'version', 'veteran', 'village', 'violent', 'virtual', 'visible', 'visitor', 'waiting',
		'walking', 'warning', 'wearing', 'weather', 'weekend', 'welfare', 'western', 'whereas', 'whereby', 'willing', 'winning',
		'without', 'workers', 'working', 'worried', 'writing', 'written'
	],
	
	// 8字母单词
	8: [
		'business', 'computer', 'consider', 'continue', 'economic', 'function', 'increase', 'interest', 'material', 'mountain',
		'movement', 'national', 'although', 'american', 'building', 'children', 'contract', 'decision', 'describe', 'discover',
		'document', 'download', 'election', 'exchange', 'facility', 'feedback', 'function', 'generate', 'graphics', 'hardware',
		'industry', 'language', 'location', 'medicine', 'member', 'military', 'minority', 'negative', 'original', 'password',
		'personal', 'physical', 'platform', 'positive', 'practice', 'previous', 'priority', 'probably', 'proposal', 'protocol',
		'provider', 'purchase', 'question', 'reaction', 'regional', 'register', 'relation', 'relative', 'remember', 'research',
		'resource', 'response', 'security', 'sentence', 'sequence', 'services', 'shopping', 'shoulder', 'somebody', 'software',
		'southern', 'standard', 'strength', 'struggle', 'surprise', 'teaching', 'together', 'transfer', 'username', 'vacation',
		'valuable', 'variable', 'violence', 'workshop', 'yourself'
	],
	
	// 9字母单词
	9: [
		'authority', 'available', 'committee', 'community', 'companies', 'computers', 'condition', 'countries', 'education',
		'effective', 'equipment', 'everybody', 'generally', 'important', 'including', 'knowledge', 'marketing', 'necessary',
		'obviously', 'operation', 'personnel', 'political', 'president', 'president', 'programme', 'reference', 'statement',
		'structure', 'technology', 'therefore', 'treatment', 'according', 'advantage', 'algorithm', 'apartment', 'associate',
		'attention', 'attribute', 'automatic', 'beginning', 'candidate', 'carefully', 'character', 'chemistry', 'christian',
		'classical', 'colleague', 'component', 'computing', 'confident', 'conscious', 'construct', 'continent', 'corporate',
		'countries', 'criterion', 'dangerous', 'democracy', 'determine', 'different', 'dimension', 'direction', 'discovery',
		'diversity', 'economics', 'eliminate', 'emergency', 'employees', 'encounter', 'encourage', 'everybody', 'excellent',
		'exception', 'existence', 'extension', 'extensive', 'favourite', 'financial', 'following', 'framework', 'frequency',
		'furniture', 'guarantee', 'guidelines', 'happening', 'highlight', 'implement', 'improving', 'including', 'indicator',
		'influence', 'initially', 'institute', 'insurance', 'integrate', 'interface', 'interpret', 'interview', 'invisible',
		'landscape', 'lifestyle', 'literally', 'marketing', 'materials', 'meanwhile', 'mechanism', 'medicine', 'messenger',
		'necessary', 'negotiate', 'neighbour', 'northeast', 'northwest', 'nutrition', 'objective', 'obviously', 'operation',
		'operators', 'organized', 'otherwise', 'packaging', 'paragraph', 'parameter', 'partially', 'passenger', 'potential',
		'precisely', 'preferred', 'preparing', 'primitive', 'principal', 'principle', 'procedure', 'processor', 'professor',
		'programme', 'publisher', 'quarterly', 'questions', 'reactions', 'realistic', 'recognize', 'recommend', 'recording',
		'reference', 'regarding', 'relations', 'religious', 'reporters', 'resources', 'responses', 'resulting', 'satisfied',
		'secretary', 'selection', 'similarly', 'sometimes', 'southeast', 'southwest', 'spiritual', 'standards', 'statement',
		'strategic', 'structure', 'subscribe', 'substance', 'suffering', 'suggested', 'suppliers', 'supported',
		'suppliers', 'synthesis', 'technical', 'technique', 'territory', 'therefore', 'tradition', 'transport', 'treatment',
		'undefined', 'universal', 'utilities', 'variation', 'wonderful'
	],
	
	// 10字母单词
	10: [
		'activities', 'additional', 'complement', 'components', 'concerning', 'conference', 'definitely', 'department',
		'developing', 'difference', 'distribute', 'evaluation', 'everything', 'experience', 'government', 'information',
		'management', 'particular', 'population', 'production', 'production', 'properties', 'proportion', 'reasonable',
		'regardless', 'restaurant', 'scientific', 'specialist', 'statistics', 'suggestion', 'technology', 'television',
		'themselves', 'throughout', 'understand', 'university', 'vegetables', 'washington', 'acceptable', 'accessible',
		'accidental', 'accomplish', 'accounting', 'activities', 'additional', 'addressing', 'adequately', 'adjustment',
		'admiration', 'advantages', 'adventures', 'afternoon', 'afterwards', 'algorithms', 'allergic', 'altogether',
		'amendments', 'analytical', 'anniversary', 'announcing', 'appearance', 'appreciate', 'approaches', 'arithmetic',
		'artificial', 'assignment', 'assistance', 'assumption', 'atmosphere', 'attachment', 'attractive', 'automobile',
		'background', 'basketball', 'beneficial', 'biological', 'boundaries', 'breakfast', 'brilliance', 'capitalism',
		'categories', 'celebrated', 'challenges', 'characters', 'charitable', 'checkpoint', 'chemicals', 'childhood',
		'cigarettes', 'citizenship', 'classified', 'collection', 'collective', 'commercial', 'commission', 'commitment',
		'comparable', 'comparison', 'compatible', 'compelling', 'complement', 'completely', 'components', 'compromise',
		'concerning', 'conclusion', 'conditions', 'conference', 'confidence', 'configured', 'connecting', 'connection',
		'conscience', 'consequent', 'considered', 'consistent', 'constitute', 'consultant', 'containers', 'continuing',
		'contribute', 'controlled', 'convenient', 'convention', 'conversion', 'coordinate', 'correction', 'corruption',
		'creativity', 'critically', 'curriculum', 'definitely', 'democratic', 'department', 'deployment', 'depression',
		'determined', 'developing', 'dictionary', 'difference', 'difficulty', 'dimensions', 'directions', 'disability',
		'discipline', 'disclaimer', 'discovered', 'discretion', 'discussion', 'distribute', 'disturbing', 'documentary',
		'efficiency', 'electronic', 'elementary', 'employment', 'encryption', 'enterprise', 'enthusiasm', 'especially',
		'established', 'evaluation', 'everything', 'excellence', 'excitement', 'experience', 'experiment', 'explanation',
		'extensions', 'facilitate', 'facilities', 'flexibility', 'foundation', 'frequently', 'friendship', 'functional',
		'generation', 'government', 'gradually', 'guidelines', 'helicopter', 'historical', 'hypothesis', 'identified',
		'importance', 'incredible', 'indicators', 'individual', 'industrial', 'infections', 'influenced', 'informing',
		'ingredients', 'innovation', 'inspection', 'installing', 'instrument', 'insurance', 'integrate', 'intellectual',
		'interested', 'interfaces', 'introduced', 'investment', 'journalism', 'laboratory', 'leadership', 'legislation',
		'management', 'manuscript', 'mathematics', 'mechanical', 'membership', 'metropolitan', 'millennium', 'monitoring',
		'motivation', 'multimedia', 'mysterious', 'navigation', 'networking', 'newsletter', 'nomination', 'obligation',
		'occupation', 'occurrence', 'operations', 'optimistic', 'ordinarily', 'originally', 'particular', 'passionate',
		'pathologic', 'percentage', 'perfection', 'performing', 'permission', 'personally', 'phenomenon', 'philosophy',
		'photograph', 'physically', 'playground', 'politician', 'popularity', 'population', 'positioned', 'practically',
		'prediction', 'preference', 'preparing', 'presenting', 'presumably', 'prevention', 'previously', 'principles',
		'priorities', 'privileged', 'procedures', 'processing', 'production', 'profession', 'properties', 'proportion',
		'prosecutor', 'protection', 'psychology', 'publishing', 'punishment', 'qualifying', 'quantities', 'reasonable',
		'recognized', 'regardless', 'registered', 'regulation', 'relatively', 'relaxation', 'reputation', 'resolution',
		'restaurant', 'restricted', 'revelation', 'revolution', 'satellites', 'scientific', 'screenplay', 'securities',
		'settlement', 'simulation', 'smartphones', 'socializing', 'specialist', 'statistics', 'structured', 'subsequent',
		'substitute', 'successful', 'sufficient', 'suggestion', 'supporting', 'surprises', 'surrounded', 'suspicious',
		'systematic', 'technology', 'television', 'temperature', 'themselves', 'thoroughly', 'throughout', 'tournament',
		'traditions', 'transition', 'travelling', 'tremendous', 'understand', 'university', 'vegetables', 'vulnerable',
		'washington', 'wheelchair', 'widespread'
	]
};

// 获取指定长度的常用单词
export function getCommonWords(length) {
	return commonWordsByLength[length] || [];
}

// 检查单词是否为常用单词
export function isCommonWord(word, length) {
	const commonWords = getCommonWords(length);
	return commonWords.includes(word.toLowerCase());
}

// 按常用程度排序单词列表
export function sortWordsByCommonness(words, length) {
	const commonWords = getCommonWords(length);
	const commonWordsSet = new Set(commonWords.map(w => w.toLowerCase()));
	
	// 分离常用单词和其他单词
	const common = [];
	const others = [];
	
	words.forEach(word => {
		if (commonWordsSet.has(word.toLowerCase())) {
			common.push(word);
		} else {
			others.push(word);
		}
	});
	
	// 按照常用单词库中的顺序排序常用单词
	common.sort((a, b) => {
		const indexA = commonWords.indexOf(a.toLowerCase());
		const indexB = commonWords.indexOf(b.toLowerCase());
		return indexA - indexB;
	});
	
	// 返回常用单词在前，其他单词在后的排序结果
	return [...common, ...others];
}

// 获取单词的重要性评分（用于排序）
export function getWordImportance(word, length) {
	const commonWords = getCommonWords(length);
	const index = commonWords.indexOf(word.toLowerCase());
	
	if (index === -1) {
		return 1000; // 非常用单词的优先级较低
	}
	
	return index; // 在常用单词库中越靠前，优先级越高
}

export default {
	getCommonWords,
	isCommonWord,
	sortWordsByCommonness,
	getWordImportance,
	commonWordsByLength
}; 