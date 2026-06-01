import json

with open('src/data/industry-academia-programs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

ncut_updates = {
    '434110010019': {
        'schedule_type': '週五、週六全天在勤益科大上課',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查30%+面試(或推薦)70%',
        'companies_clean': ['盈錫精密工業','崴立機電','合濟工業','台中精機廠','台灣引興','律豐工業','振鋒企業','百容電子','今國光學','保勝光學','英發企業','羅翌科技','誠岱機械廠','新益機械工廠','六鑫','勝源機械','天陽航太','順德工業','詠基工業','鴻揚機械','立穩機電','久裕興業','睦茗精密齒輪','聖杰國際','銓寶工業','利茗機械','上銀科技'],
        'required_departments': ['機械領域'],
        'partner_high_schools': '臺中高工',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110010020': {
        'schedule_type': '週五、週六全天在勤益科大上課',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查30%+面試(或推薦)70%',
        'companies_clean': ['上銀科技','巨大機械','明昌國際','崴立機電','台灣引興','立穩機電','久裕興業','百容電子','今國光學','天陽航太','順德工業','利茗機械','盈錫精密','睦茗精密齒輪','保勝光學','銓寶工業','振鋒企業','誠岱機械廠','勝源機械','新益機械工廠','詠基工業','英發企業','合濟工業','台中精機廠','六鑫','律豐工業','鴻揚機械','永豐齒輪','羅翌科技'],
        'required_departments': ['機械領域'],
        'partner_high_schools': '大甲高工、神岡高工、霧峰農工、東勢高工',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110010021': {
        'schedule_type': '週五及週六整天於學校上課',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查40%+面試(或推薦)40%+加分選項20%',
        'companies_clean': ['翔盟科技工程','沙鹿冷氣','日祥工程企業','侑興電器','科基企業','哈伯精密','三可德冷凍空調','誠午電機技術顧問','昌霖冷凍空調','大地昌興業','保信節能科技','四維冷氣興業','聚賢研發','安穆科技','世進企業社','弘瀠冷凍空調','華葳集成','吉立冷氣企業','金華節能空調科技','捷正公寓大廈管理維護'],
        'required_departments': ['冷凍空調領域'],
        'partner_high_schools': '臺中高工',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110010022': {
        'schedule_type': '週五及週六整天在勤益科大上課',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查30%+面試50%+加分選項20%',
        'companies_clean': ['上銀科技','大立機器工業','天源義記機械','台中精機廠','台灣引興','永豐齒輪','立穩機電','宇隆科技','朋吉實業','玟揚精密工業','奕達精機','宣鑫企業','國揚電梯工業','國愷興業','國睦工業','義高工業','德川機械'],
        'required_departments': ['電機','電子','機械領域'],
        'partner_high_schools': '泰山高中、淡水商工、後壁高中、花蓮高工、神岡高工',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110010023': {
        'schedule_type': '週一至週五晚上於學校上課',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查30%+面試(或推薦)70%+弱勢加分5%',
        'companies_clean': ['上銀科技','江岱電機行','百容電子','崴立機電','誠岱機械廠','台灣引興','永進機械工業','台中精機廠','新虎將機械工業','佳音通信','勝源機械','燿生機械工業','正麒電機實業'],
        'required_departments': ['電機','電子','機械領域'],
        'partner_high_schools': '彰師附工、東勢高工、苗栗農工、霧峰農工、民雄農工、大甲高工',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110010024': {
        'schedule_type': '每週實習4天、上課2天、休息1天',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查30%+面試(或推薦)70%+加分選項另加20%',
        'companies_clean': ['友達光電','鴻佰科技'],
        'required_departments': ['電資領域'],
        'partner_high_schools': '新民高中、慈明高中、中山工商、治平高中',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110010025': {
        'schedule_type': '每週實習4天、上課2天、休息1天',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查30%+面試50%+加分選項另加20%',
        'companies_clean': ['友達光電','鴻佰科技'],
        'required_departments': ['電資領域'],
        'partner_high_schools': '二林工商、水里商工、中山工商',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110010026': {
        'schedule_type': '421制：每週工作4天、上課2天、休息1天',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查40%+面試50%+加分選項10%',
        'companies_clean': ['矽品精密工業','超豐電子'],
        'required_departments': ['電資領域'],
        'partner_high_schools': '岡山農工、屏東高工、埔里高工、新營高工、達德商工',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110010027': {
        'schedule_type': '週二、週四晚上及週六於學校上課',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查30%+面試50%+加分選項20%',
        'companies_clean': ['大立機器工業','天源義記機械','台灣引興','台中精機廠','台灣櫻花','永豐齒輪','立穩機電','有達工業','利茗機械','盈錫精密工業','華廣生技','睦茗精密齒輪','榮富工業','磯鑫工業','寶嘉誠工業'],
        'required_departments': ['管理','機械領域'],
        'partner_high_schools': '北門農工、二林工商、新營高工',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110010028': {
        'schedule_type': '週一至週五安排2-3天晚上及週六於學校上課',
        'eligibility_type': '合作技高優先，缺額開放他校',
        'exam_criteria': '書面審查30%+面試(或推薦)50%+加分選項20%',
        'companies_clean': ['上銀科技','順德工業','立穩機電','百容電子','盈錫精密工業','韋僑科技','睦茗精密齒輪','宏全國際','宏合精研','磯鑫工業','愛普智科技','力山工業','利茗機械','錫昌科技企業','中陽實業','台灣櫻花','宇特精密工業','勝源機械','億典企業'],
        'required_departments': ['機械','資訊領域'],
        'partner_high_schools': '秀水高工、虎尾農工、光華高工、致用高中、新民高中',
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/467e8389-883c-4009-becb-6a2feb7a2407',
    },
    '434110020029': {
        'schedule_type': '第1年中彰投分署職訓，第2-4年夜間上課+日間企業實習',
        'eligibility_type': '開放所有高中職生報名',
        'exam_criteria': '面試50%+書面審查45%+弱勢證明5%',
        'companies_clean': [],
        'required_departments': ['機械領域'],
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/0518b5be-3d9f-4417-91bc-359bf0df7a6d',
    },
    '434110020030': {
        'schedule_type': '第1年中彰投分署職訓，第2-4年夜間上課+日間企業實習',
        'eligibility_type': '開放所有高中職生報名',
        'exam_criteria': '面試70%+書面審查30%',
        'companies_clean': [],
        'required_departments': ['電機','電子領域'],
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/0518b5be-3d9f-4417-91bc-359bf0df7a6d',
    },
    '434110020031': {
        'schedule_type': '第1年中彰投分署職訓，第2-4年週五晚+週六上課+日間企業實習',
        'eligibility_type': '開放所有高中職生報名',
        'exam_criteria': '面試50%+書面審查50%',
        'companies_clean': [],
        'required_departments': ['冷凍空調','電機','自控'],
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/0518b5be-3d9f-4417-91bc-359bf0df7a6d',
    },
    '434110030032': {
        'schedule_type': '日間企業實習，週五公假返校上課',
        'eligibility_type': '開放所有高中職生報名',
        'exam_criteria': '面試60%+書面審查40%',
        'companies_clean': ['上銀科技','大光長榮機械','天源義記機械','永湖複合材料','立督科技','立穩機電','宇隆科技','明昌國際','信邦電子','哈伯精密','健椿工業','國帥工業','晨州塑膠工業','富田電機','墨達思精密工業','鋐光實業','靄崴科技'],
        'required_departments': ['AI科技','製造'],
        'brochure_url': 'https://industry.ncut.edu.tw/WebApi/Tools/GetAttach/88819e58-3d60-4b79-b1d6-e2df32176f74',
    },
}

count = 0
for prog in data:
    if prog['pid'] in ncut_updates:
        update = ncut_updates[prog['pid']]
        for key, value in update.items():
            prog[key] = value
        count += 1

with open('src/data/industry-academia-programs.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Updated {count} NCUT programs with complete brochure data")
