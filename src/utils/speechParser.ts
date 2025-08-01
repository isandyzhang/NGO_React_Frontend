/**
 * 語音轉文字內容智能解析工具
 * 用於從語音轉換的文字中提取個人資訊並自動填入表單
 */

export interface ParsedPersonInfo {
  name?: string;
  gender?: 'Male' | 'Female';
  birthday?: string; // YYYY-MM-DD 格式
  idNumber?: string;
  phone?: string;
  email?: string;
  city?: string;
  district?: string;
  address?: string;
}

/**
 * 智能解析語音轉文字內容
 * @param text 語音轉換的文字內容
 * @returns 解析出的個人資訊
 */
export function parsePersonInfoFromSpeech(text: string): ParsedPersonInfo {
  const result: ParsedPersonInfo = {};
  
  // 清理文字，移除多餘的標點符號
  const cleanText = text.replace(/[，。！？\s]+/g, ' ').trim();
  
  console.log('開始解析語音內容:', cleanText);
  
  // 1. 解析姓名
  const namePatterns = [
    /我的名字是([^，。！？\s]{2,4})/,
    /名字是([^，。！？\s]{2,4})/,
    /我是([^，。！？\s]{2,4})/,
    /我叫([^，。！？\s]{2,4})/
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = cleanText.match(pattern);
    if (nameMatch) {
      result.name = nameMatch[1];
      console.log('解析到姓名:', result.name);
      break;
    }
  }
  
  // 2. 解析性別
  if (cleanText.includes('男生') || cleanText.includes('男性') || cleanText.includes('是男')) {
    result.gender = 'Male';
    console.log('解析到性別: 男');
  } else if (cleanText.includes('女生') || cleanText.includes('女性') || cleanText.includes('是女')) {
    result.gender = 'Female';
    console.log('解析到性別: 女');
  }
  
  // 3. 解析生日
  const birthdayPatterns = [
    /生日是?(\d{4})年?(\d{1,2})月?(\d{1,2})[日號]?/,
    /出生.*?(\d{4})年?(\d{1,2})月?(\d{1,2})[日號]?/,
    /(\d{4})年?(\d{1,2})月?(\d{1,2})[日號]/
  ];
  
  for (const pattern of birthdayPatterns) {
    const birthdayMatch = cleanText.match(pattern);
    if (birthdayMatch) {
      const year = birthdayMatch[1];
      const month = birthdayMatch[2].padStart(2, '0');
      const day = birthdayMatch[3].padStart(2, '0');
      result.birthday = `${year}-${month}-${day}`;
      console.log('解析到生日:', result.birthday);
      break;
    }
  }
  
  // 4. 解析身分證字號
  const idPatterns = [
    /身份?證[字號碼]*是?([A-Z]\d{9})/,
    /身分[字號碼]{1,3}是?([A-Z]\d{9})/,
    /ID.*?([A-Z]\d{9})/,
    /([A-Z]\d{9})/
  ];
  
  for (const pattern of idPatterns) {
    const idMatch = cleanText.match(pattern);
    if (idMatch) {
      result.idNumber = idMatch[1];
      console.log('解析到身分證字號:', result.idNumber);
      break;
    }
  }
  
  // 5. 解析電話號碼
  const phonePatterns = [
    /手機號碼是?(09\d{8})/,
    /[聯絡電話]{3,4}是?(09\d{8})/,
    /手機.*?(09\d{8})/,
    /電話.*?(09\d{8})/,
    /(09\d{8})/
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatch = cleanText.match(pattern);
    if (phoneMatch) {
      result.phone = phoneMatch[1];
      console.log('解析到電話:', result.phone);
      break;
    }
  }
  
  // 6. 解析 Email
  const emailPatterns = [
    /[eE]?[mM]ail.*?([a-zA-Z0-9._-]+[嚇小]?老鼠[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    /信箱.*?([a-zA-Z0-9._-]+[嚇小]?老鼠[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    /([a-zA-Z0-9._-]+[嚇小]?老鼠[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    /[eE]?[mM]ail.*?([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    /信箱.*?([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  ];
  
  for (const pattern of emailPatterns) {
    const emailMatch = cleanText.match(pattern);
    if (emailMatch) {
      let email = emailMatch[1].toLowerCase();
      // 修正語音辨識的 @ 符號錯誤
      email = email.replace(/嚇老鼠/g, '@').replace(/小老鼠/g, '@');
      result.email = email;
      console.log('解析到Email:', result.email);
      break;
    }
  }
  
  // 7. 解析地址
  const addressPatterns = [
    // 包含詳細地址的模式
    /地址是?.*?在([^，。！？\s]{2,4}市).*?([^，。！？\s]{2,4}區)([^，。！？]*)/,
    /我住在([^，。！？\s]{2,4}市).*?([^，。！？\s]{2,4}區)([^，。！？]*)/,
    // 基本城市區域模式  
    /地址是?([^，。！？\s]{2,4}市).*?([^，。！？\s]{2,4}區)/,
    /住在([^，。！？\s]{2,4}市).*?([^，。！？\s]{2,4}區)/,
    /我住在([^，。！？\s的]{2,4})[市的].*?([^，。！？\s的]{2,4})/,
    /([^，。！？\s]{2,4}市).*?([^，。！？\s]{2,4}區)/
  ];
  
  // 精確的地址模式，只匹配真正的地址格式
  const detailAddressPatterns = [
    /(文心路[一二三四五六七八九十]*段?[0-9]+號?)/g,
    /(溫馨路[一二三四五六七八九十]*段?[0-9]+號?)/g,
    /([A-Za-z\u4e00-\u9fa5]{2,6}路[一二三四五六七八九十]*段?[0-9]+號?)/g,
    /([A-Za-z\u4e00-\u9fa5]{2,6}街[一二三四五六七八九十]*段?[0-9]+號?)/g,
    /([A-Za-z\u4e00-\u9fa5]{2,6}巷[一二三四五六七八九十]*段?[0-9]+號?)/g,
    /([A-Za-z\u4e00-\u9fa5]{2,6}弄[一二三四五六七八九十]*段?[0-9]+號?)/g
  ];
  
  for (const pattern of addressPatterns) {
    const addressMatch = cleanText.match(pattern);
    if (addressMatch) {
      let city = addressMatch[1];
      let district = addressMatch[2];
      let detailAddress = addressMatch[3] || '';
      
      // 清理城市名稱（移除前綴介詞）
      city = city.replace(/^在/, '').replace(/^的/, '');
      if (!city.includes('市') && !city.includes('縣')) {
        city = city + '市'; // 自動補全
      }
      
      // 清理區域名稱（移除前綴介詞）
      district = district.replace(/^在/, '').replace(/^的/, '');
      if (!district.includes('區')) {
        district = district + '區'; // 自動補全
      }
      
      result.city = city;
      result.district = district;
      
      // 清理詳細地址
      if (detailAddress) {
        detailAddress = detailAddress.trim();
        // 移除開頭的標點符號或空格
        detailAddress = detailAddress.replace(/^[，。！？\s的在]+/, '');
      }
      
      console.log('解析到城市:', result.city);
      console.log('解析到區域:', result.district);
      console.log('詳細地址片段:', detailAddress);
      break;
    }
  }
  
  // 單獨搜尋所有詳細地址，並選擇最佳匹配
  const allAddresses: string[] = [];
  for (const pattern of detailAddressPatterns) {
    const matches = [...cleanText.matchAll(pattern)];
    matches.forEach(match => {
      let address = match[1].trim();
      // 清理地址，移除前綴文字
      address = address.replace(/.*?([A-Za-z\u4e00-\u9fa5]{2,6}[路街巷弄].*?)$/, '$1');
      // 確保地址以路/街/巷/弄開頭，並且有門牌號碼
      if (address && /^[A-Za-z\u4e00-\u9fa5]{2,6}[路街巷弄].*[0-9]+號?$/.test(address) && !allAddresses.includes(address)) {
        allAddresses.push(address);
      }
    });
  }
  
  console.log('找到的所有地址:', allAddresses);
  
  if (allAddresses.length > 0) {
    // 選擇最佳地址：優先選擇乾淨的地址片段（不含區域前綴）
    let bestAddress = allAddresses[0];
    
    // 優先選擇不含區域前綴的地址
    for (const addr of allAddresses) {
      // 如果地址不含"區"等前綴，優先選擇
      if (!addr.includes('區') && !addr.includes('市') && !addr.includes('的') && !addr.includes('在')) {
        bestAddress = addr;
        break;
      }
    }
    
    // 如果沒找到乾淨的地址，再考慮包含段數的地址
    if (bestAddress.includes('區') || bestAddress.includes('的')) {
      for (const addr of allAddresses) {
        if (!addr.includes('區') && !addr.includes('的')) {
          bestAddress = addr;
          break;
        }
        // 如果包含段數，也優先選擇
        if (addr.includes('段') || addr.includes('一') || addr.includes('二') || addr.includes('三')) {
          bestAddress = addr;
          break;
        }
      }
    }
    
    // 清除地址前綴
    bestAddress = bestAddress.replace(/^.*?的/, '').replace(/^.*?區/, '').replace(/^在/, '');
    
    console.log('選擇的最佳地址:', bestAddress);
    
    // 詳細地址欄位只填入地址片段，不包含城市區域
    result.address = bestAddress;
    console.log('詳細地址:', result.address);
  }
  
  console.log('解析結果:', result);
  return result;
}

/**
 * 驗證解析結果的準確性
 * @param info 解析出的個人資訊
 * @returns 驗證結果和建議
 */
export function validateParsedInfo(info: ParsedPersonInfo): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // 驗證身分證字號格式
  if (info.idNumber && !/^[A-Z]\d{9}$/.test(info.idNumber)) {
    warnings.push('身分證字號格式可能不正確');
    suggestions.push('請檢查身分證字號是否為一個英文字母加九個數字');
  }
  
  // 驗證電話號碼格式
  if (info.phone && !/^09\d{8}$/.test(info.phone)) {
    warnings.push('手機號碼格式可能不正確');
    suggestions.push('請檢查手機號碼是否為09開頭的十位數字');
  }
  
  // 驗證 Email 格式
  if (info.email && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(info.email)) {
    warnings.push('Email 格式可能不正確');
    suggestions.push('請檢查 Email 格式是否正確');
  }
  
  // 驗證生日格式
  if (info.birthday) {
    const date = new Date(info.birthday);
    const now = new Date();
    if (isNaN(date.getTime()) || date > now) {
      warnings.push('生日日期可能不正確');
      suggestions.push('請檢查生日是否為有效日期且不能是未來日期');
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}