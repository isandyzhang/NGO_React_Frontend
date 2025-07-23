// 圖片生成服務測試文件
// 這個文件用於測試 imageGenerationService 的功能

import imageGenerationService from './imageGenerationService';

// 測試驗證功能
console.log('測試圖片描述驗證功能:');

const testPrompts = [
  '', // 空描述
  'a', // 太短
  'A beautiful landscape with mountains and trees in the background, perfect for a nature activity', // 正常描述
  'x'.repeat(1001), // 太長
];

testPrompts.forEach(prompt => {
  const result = imageGenerationService.validatePrompt(prompt);
  console.log(`描述: "${prompt.substring(0, 20)}..." -> 有效: ${result.isValid}, 訊息: ${result.message}`);
});

// 測試 Base64 轉換功能
console.log('\n測試 Base64 轉換功能:');

const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
try {
  const file = imageGenerationService.base64ToFile(testBase64, 'test.png');
  console.log('Base64 轉換成功:', file.name, file.type, file.size);
} catch (error) {
  console.error('Base64 轉換失敗:', error);
}

export {}; 