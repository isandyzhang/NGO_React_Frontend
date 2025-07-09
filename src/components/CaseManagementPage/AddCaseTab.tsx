import React from 'react';
import AddCaseStepperForm from './AddCaseStepperForm';

/**
 * 新增個案表單組件
 * 
 * 使用分页表单（Stepper）来新增个案，包含6个步骤：
 * 1. 基本資料 - 姓名、性別、生日
 * 2. 身份資訊 - 身分證字號、電話
 * 3. 地址資訊 - 城市、地區、詳細地址
 * 4. 聯絡資訊 - Email
 * 5. 困難類型 - 個案困難類型
 * 6. 照片上傳 - 個人照片
 */

const AddCaseTab: React.FC = () => {
  return <AddCaseStepperForm />;
};

export { AddCaseTab };
export default AddCaseTab; 