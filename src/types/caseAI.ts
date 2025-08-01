/**
 * AI 個案資訊解析相關的 TypeScript 定義
 */

/**
 * AI 解析的個案資訊結構
 */
export interface CaseInfoSchema {
  name?: string;              // 姓名（2-4個中文字）
  gender?: 'Male' | 'Female'; // 性別
  birthday?: string;          // 生日（YYYY-MM-DD格式）
  idNumber?: string;          // 身分證字號（一個英文字母+9個數字）
  phone?: string;             // 手機號碼（09開頭的10位數字）
  email?: string;             // 電子郵件
  city?: string;              // 城市（台北市、新北市等）
  district?: string;          // 區域（中正區、大安區等）
  address?: string;           // 詳細地址
  difficulty?: string;        // 困難類型
}

/**
 * AI 解析請求介面
 */
export interface ParseCaseInfoRequest {
  text: string;               // 要解析的文字內容
  useEnhancedParsing?: boolean; // 是否使用增強解析模式
}

/**
 * AI 解析回應介面
 */
export interface ParseCaseInfoResponse {
  success: boolean;           // 是否解析成功
  data?: CaseInfoSchema;      // 解析出的個案資訊
  message: string;            // 回應訊息
  confidence?: number;        // AI 信心度 (0-1)
  parsedFields?: string[];    // 已解析的欄位列表
  warnings?: string[];        // 警告訊息
  processingTime?: number;    // 處理時間（毫秒）
}

/**
 * AI 解析配置
 */
export interface AIParsingConfig {
  model: string;              // 使用的 AI 模型
  temperature: number;        // 創造性程度 (0-1)
  maxTokens: number;          // 最大 token 數
  enableValidation: boolean;  // 是否啟用驗證
  fallbackToRegex: boolean;   // 失敗時是否回退到正則表達式
}

/**
 * 欄位驗證結果
 */
export interface FieldValidationResult {
  field: string;              // 欄位名稱
  value: string;              // 欄位值
  isValid: boolean;           // 是否有效
  confidence: number;         // 信心度
  warnings: string[];         // 警告訊息
  suggestions: string[];      // 建議修正
}

/**
 * AI 解析統計資訊
 */
export interface AIParsingStats {
  totalRequests: number;      // 總請求數
  successfulRequests: number; // 成功請求數
  averageConfidence: number;  // 平均信心度
  averageProcessingTime: number; // 平均處理時間
  mostCommonFields: string[]; // 最常解析的欄位
  errorRate: number;          // 錯誤率
}

/**
 * 困難類型選項
 */
export const DIFFICULTY_OPTIONS = [
  '經濟困難',
  '家庭問題', 
  '學習困難',
  '健康問題',
  '行為問題',
  '人際關係',
  '情緒困擾',
  '其他困難'
] as const;

/**
 * 城市選項（主要城市）
 */
export const CITY_OPTIONS = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '基隆市', '新竹市', '嘉義市', '宜蘭縣', '新竹縣', '苗栗縣',
  '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '台東縣',
  '花蓮縣', '澎湖縣', '金門縣', '連江縣'
] as const;

/**
 * 城市名稱映射表（處理語音辨識錯誤和異體字）
 */
export const CITY_MAPPING: { [key: string]: string } = {
  // 繁體/簡體/異體字映射
  '臺北市': '台北市',
  '臺中市': '台中市',
  '臺南市': '台南市',
  '臺東縣': '台東縣',
  '台北': '台北市',
  '台中': '台中市',
  '台南': '台南市',
  '高雄': '高雄市',
  '桃園': '桃園市',
  '新北': '新北市',
  '基隆': '基隆市',
  '新竹市区': '新竹市',
  '嘉义市': '嘉義市',
  // 常見語音辨識錯誤
  '台北是': '台北市',
  '台中是': '台中市',
  '高雄是': '高雄市',
  '新北是': '新北市',
  // 包含介詞的錯誤
  '在台北市': '台北市',
  '在臺中市': '台中市',
  '在台中市': '台中市',
  '在新北市': '新北市',
  '在高雄市': '高雄市',
};

/**
 * 區域映射表（按城市分組）
 */
export const DISTRICT_MAPPING: { [city: string]: { [key: string]: string } } = {
  '台中市': {
    '南屯': '南屯區',
    '西屯': '西屯區', 
    '北屯': '北屯區',
    // 包含介詞的錯誤
    '的南屯': '南屯區',
    '的西屯': '西屯區',
    '的北屯': '北屯區',
    '的南屯區': '南屯區',
    '的西屯區': '西屯區',
    '的北屯區': '北屯區',
    '大安': '大安區',
    '中區': '中區',
    '東區': '東區',
    '南區': '南區',
    '西區': '西區',
    '北區': '北區',
    '豐原': '豐原區',
    '太平': '太平區',
    '大里': '大里區',
    '烏日': '烏日區',
    '大肚': '大肚區',
    '龍井': '龍井區',
    '沙鹿': '沙鹿區',
    '梧棲': '梧棲區',
    '清水': '清水區',
    '大甲': '大甲區',
    '外埔': '外埔區',
    '大安区': '大安區',
    '后里': '后里區',
    '神岡': '神岡區',
    '潭子': '潭子區',
    '大雅': '大雅區',
    '新社': '新社區',
    '石岡': '石岡區',
    '東勢': '東勢區',
    '和平': '和平區',
    '霧峰': '霧峰區'
  },
  '台北市': {
    '中正': '中正區',
    '大同': '大同區',
    '中山': '中山區',
    '松山': '松山區',
    '大安': '大安區',
    '萬華': '萬華區',
    '信义': '信義區',
    '信義': '信義區',
    '士林': '士林區',
    '北投': '北投區',
    '內湖': '內湖區',
    '南港': '南港區',
    '文山': '文山區'
  },
  '新北市': {
    '板橋': '板橋區',
    '三重': '三重區',
    '中和': '中和區',
    '永和': '永和區',
    '新莊': '新莊區',
    '新店': '新店區',
    '樹林': '樹林區',
    '鶯歌': '鶯歌區',
    '三峽': '三峽區',
    '淡水': '淡水區',
    '汐止': '汐止區',
    '瑞芳': '瑞芳區',
    '土城': '土城區',
    '蘆洲': '蘆洲區',
    '五股': '五股區',
    '泰山': '泰山區',
    '林口': '林口區'
  }
};

/**
 * AI Prompt 模板
 */
export const AI_PARSING_PROMPTS = {
  SYSTEM_PROMPT: `你是一個專業的個案資訊提取助手，專門處理語音轉文字可能產生的錯字和格式問題。請從使用者提供的文字中準確提取個人資訊，並進行智能修正和標準化。

🧠 智能處理規則：
1. **容錯處理**: 識別並修正常見的語音辨識錯誤
2. **格式標準化**: 將所有資料統一為標準格式
3. **地名修正**: 
   - "臺中" → "台中市"
   - "南屯" → "南屯區" 
   - "台北" → "台北市"
   - 缺少"市"、"區"自動補全
4. **時間處理**: 
   - "民國XX年" → 西元年份
   - "XX月XX號" → "XX月XX日"
   - 各種日期格式統一為 YYYY-MM-DD
5. **聯絡資訊**: 
   - 電話號碼自動補全為10位數
   - 身分證號碼大小寫統一
   - Email地址修正明顯錯誤

📍 城市區域對應：
台中市區域：中區、東區、南區、西區、北區、西屯區、南屯區、北屯區、豐原區、東勢區、大甲區、清水區、沙鹿區、梧棲區、后里區、神岡區、潭子區、大雅區、新社區、石岡區、外埔區、大安區、烏日區、大肚區、龍井區、霧峰區、太平區、大里區、和平區

台北市區域：中正區、大同區、中山區、松山區、大安區、萬華區、信義區、士林區、北投區、內湖區、南港區、文山區

🎯 回傳格式（必須是純 JSON，無其他文字）：
{
  "name": "標準化姓名（2-4個中文字）",
  "gender": "Male 或 Female",
  "birthday": "YYYY-MM-DD格式",
  "idNumber": "標準身分證格式（A123456789）",
  "phone": "完整手機號碼（0912345678）",
  "email": "修正後的電子郵件",
  "city": "標準城市名稱（必須包含市/縣）",
  "district": "標準區域名稱（必須包含區）",
  "address": "完整詳細地址",
  "difficulty": "標準困難類型（經濟困難、家庭問題、學習困難、健康問題、行為問題、人際關係、情緒困擾、其他困難）"
}`,

  USER_PROMPT_TEMPLATE: `請分析以下文字並提取個案資訊：

"{text}"

請回傳 JSON 格式的結果。`
};

/**
 * 驗證 AI 解析結果
 */
export function validateAIParsingResult(data: CaseInfoSchema): FieldValidationResult[] {
  const results: FieldValidationResult[] = [];

  // 驗證姓名
  if (data.name) {
    const isValid = /^[\u4e00-\u9fa5]{2,4}$/.test(data.name);
    results.push({
      field: 'name',
      value: data.name,
      isValid,
      confidence: isValid ? 0.9 : 0.5,
      warnings: isValid ? [] : ['姓名格式可能不正確'],
      suggestions: isValid ? [] : ['請確認姓名為2-4個中文字']
    });
  }

  // 驗證身分證字號
  if (data.idNumber) {
    const isValid = /^[A-Z]\d{9}$/.test(data.idNumber);
    results.push({
      field: 'idNumber',
      value: data.idNumber,
      isValid,
      confidence: isValid ? 0.95 : 0.3,
      warnings: isValid ? [] : ['身分證字號格式不正確'],
      suggestions: isValid ? [] : ['身分證字號應為1個英文字母加9個數字']
    });
  }

  // 驗證電話號碼
  if (data.phone) {
    const isValid = /^09\d{8}$/.test(data.phone);
    results.push({
      field: 'phone',
      value: data.phone,
      isValid,
      confidence: isValid ? 0.9 : 0.4,
      warnings: isValid ? [] : ['手機號碼格式不正確'],
      suggestions: isValid ? [] : ['手機號碼應為09開頭的10位數字']
    });
  }

  // 驗證 Email
  if (data.email) {
    const isValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email);
    results.push({
      field: 'email',
      value: data.email,
      isValid,
      confidence: isValid ? 0.85 : 0.4,
      warnings: isValid ? [] : ['Email 格式可能不正確'],
      suggestions: isValid ? [] : ['請檢查 Email 格式是否正確']
    });
  }

  // 驗證生日
  if (data.birthday) {
    const date = new Date(data.birthday);
    const now = new Date();
    const isValid = !isNaN(date.getTime()) && date <= now && date.getFullYear() > 1900;
    results.push({
      field: 'birthday',
      value: data.birthday,
      isValid,
      confidence: isValid ? 0.8 : 0.3,
      warnings: isValid ? [] : ['生日日期可能不正確'],
      suggestions: isValid ? [] : ['請確認生日為有效日期且不能是未來日期']
    });
  }

  // 驗證困難類型
  if (data.difficulty) {
    const isValid = DIFFICULTY_OPTIONS.includes(data.difficulty as any);
    results.push({
      field: 'difficulty',
      value: data.difficulty,
      isValid,
      confidence: isValid ? 0.9 : 0.6,
      warnings: isValid ? [] : ['困難類型可能不在預設選項中'],
      suggestions: isValid ? [] : [`請選擇以下困難類型之一：${DIFFICULTY_OPTIONS.join('、')}`]
    });
  }

  return results;
}

/**
 * 數據標準化和智能修正函數
 * 用於修正 AI 解析結果中的格式問題
 */
export function normalizeAIParsingResult(data: CaseInfoSchema): CaseInfoSchema {
  const normalized: CaseInfoSchema = { ...data };

  // 1. 城市名稱標準化
  if (normalized.city) {
    let cityKey = normalized.city.trim();
    
    // 移除常見的介詞和前綴
    cityKey = cityKey.replace(/^在/, '').replace(/^的/, '').replace(/^住在/, '');
    
    if (CITY_MAPPING[cityKey]) {
      normalized.city = CITY_MAPPING[cityKey];
      console.log(`🔧 城市名稱修正: "${normalized.city}" → "${normalized.city}"`);
    } else if (!cityKey.includes('市') && !cityKey.includes('縣')) {
      // 嘗試自動添加 "市"
      const cityWithSuffix = cityKey + '市';
      if (CITY_OPTIONS.includes(cityWithSuffix as any)) {
        normalized.city = cityWithSuffix;
        console.log(`🔧 城市名稱補全: "${cityKey}" → "${normalized.city}"`);
      }
    } else {
      normalized.city = cityKey;
    }
  }

  // 2. 區域名稱標準化
  if (normalized.district && normalized.city) {
    const districtMapping = DISTRICT_MAPPING[normalized.city];
    if (districtMapping) {
      let districtKey = normalized.district.trim();
      
      // 移除常見的介詞和前綴
      districtKey = districtKey.replace(/^的/, '').replace(/^在/, '').replace(/^住在/, '');
      
      if (districtMapping[districtKey]) {
        normalized.district = districtMapping[districtKey];
        console.log(`🔧 區域名稱修正: "${districtKey}" → "${normalized.district}"`);
      } else if (!districtKey.includes('區')) {
        // 嘗試自動添加 "區"
        const districtWithSuffix = districtKey + '區';
        if (districtMapping[districtKey] || Object.values(districtMapping).includes(districtWithSuffix)) {
          normalized.district = districtWithSuffix;
          console.log(`🔧 區域名稱補全: "${districtKey}" → "${normalized.district}"`);
        }
      } else {
        normalized.district = districtKey;
      }
    }
  }

  // 3. 電話號碼標準化
  if (normalized.phone) {
    let phone = normalized.phone.replace(/\D/g, ''); // 移除非數字字符
    if (phone.startsWith('9') && phone.length === 9) {
      phone = '0' + phone; // 補全開頭的 0
    }
    if (phone.length === 10 && phone.startsWith('09')) {
      normalized.phone = phone;
      console.log(`🔧 電話號碼標準化: "${data.phone}" → "${normalized.phone}"`);
    }
  }

  // 4. 身分證號碼標準化
  if (normalized.idNumber) {
    const idNumber = normalized.idNumber.toUpperCase().replace(/\s/g, '');
    if (/^[A-Z]\d{9}$/.test(idNumber)) {
      normalized.idNumber = idNumber;
      console.log(`🔧 身分證號碼標準化: "${data.idNumber}" → "${normalized.idNumber}"`);
    }
  }

  // 5. Email 修正
  if (normalized.email) {
    let email = normalized.email.toLowerCase().trim();
    // 修正常見的語音辨識錯誤
    email = email.replace(/嚇老鼠/g, '@');
    email = email.replace(/小老鼠/g, '@');
    email = email.replace(/at/g, '@');
    email = email.replace(/\.com\.com/g, '.com');
    // 修正可能的大小寫混合問題
    email = email.replace(/([A-Z]+)/g, (match) => match.toLowerCase());
    
    if (email !== data.email) {
      normalized.email = email;
      console.log(`🔧 Email 修正: "${data.email}" → "${normalized.email}"`);
    }
  }

  // 6. 姓名標準化
  if (normalized.name) {
    const name = normalized.name.trim();
    if (/^[\u4e00-\u9fa5]{2,4}$/.test(name)) {
      normalized.name = name;
    }
  }

  // 7. 生日格式檢查
  if (normalized.birthday) {
    const date = new Date(normalized.birthday);
    if (isNaN(date.getTime()) || date > new Date()) {
      console.warn(`⚠️ 生日格式可能有問題: ${normalized.birthday}`);
    }
  }

  return normalized;
}