import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';
import { THEME_COLORS } from '../../styles/theme';
import { getValidationStyle, getSelectValidationStyle, getDatePickerValidationStyle } from '../../styles/commonStyles';

// 設置 dayjs 為中文
dayjs.locale('zh-tw');

interface CaseDetailFormData {
  contact_name: string;
  contact_relation: string;
  contact_phone: string;
  home_phone: string;
  family_status: string;
  fq: string;
  family_members: string;
  family_type: string;
  parent_nation_father: string;
  parent_nation_mother: string;
  residence: string;
  main_caregiver_name: string;
  main_caregiver_relation: string;
  main_caregiver_id: string;
  main_caregiver_birth: Dayjs | null;
  main_caregiver_job: string;
  main_caregiver_marry_status: string;
  main_caregiver_edu: string;
  source: string;
  help_experience: string;
  consultation: string;
  note: string;
}

interface CaseDetailFormProps {
  formData: CaseDetailFormData;
  onInputChange: (field: keyof CaseDetailFormData, value: string) => void;
  onDateChange: (field: keyof CaseDetailFormData, value: Dayjs | null) => void;
  fieldErrors: { [key: string]: boolean };
}

const CaseDetailForm: React.FC<CaseDetailFormProps> = ({
  formData,
  onInputChange,
  onDateChange,
  fieldErrors,
}) => {
  // 選項資料
  const relationOptions = [
    '父親', '母親', '祖父', '祖母', '外祖父', '外祖母', '兄弟', '姐妹', '叔叔', '阿姨', '其他'
  ];

  const familyTypeOptions = [
    '核心家庭', '單親家庭', '重組家庭', '隔代教養', '寄養家庭', '其他'
  ];

  const nationOptions = [
    '台灣', '中國大陸', '香港', '澳門', '東南亞', '其他'
  ];

  const marryStatusOptions = [
    '未婚', '已婚', '離婚', '喪偶', '分居', '其他'
  ];

  const eduOptions = [
    '不識字', '國小', '國中', '高中職', '專科', '大學', '研究所', '其他'
  ];

  const sourceOptions = [
    '自行求助', '學校轉介', '醫院轉介', '社福機構轉介', '鄰里通報', '其他'
  ];

  return (
    <Box sx={{ 
      bgcolor: THEME_COLORS.BACKGROUND_CARD,
      borderRadius: 2,
      p: 3,
      border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ 
          color: THEME_COLORS.TEXT_PRIMARY,
          fontWeight: 600,
          mb: 2,
        }}>
          個案詳細資料
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 聯絡人資訊 */}
        <Box>
          <Typography variant="subtitle1" sx={{ 
            color: THEME_COLORS.TEXT_SECONDARY,
            fontWeight: 600,
            mb: 2,
            borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
            pb: 1,
          }}>
            聯絡人資訊
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField
              fullWidth
              label="聯絡人姓名"
              value={formData.contact_name}
              onChange={(e) => onInputChange('contact_name', e.target.value)}
              sx={getValidationStyle(fieldErrors.contact_name)}
              required
              placeholder="請輸入聯絡人姓名"
            />
            
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.contact_relation)}>
              <InputLabel>與案主關係</InputLabel>
              <Select
                value={formData.contact_relation}
                onChange={(e) => onInputChange('contact_relation', e.target.value)}
                label="與案主關係"
                required
              >
                {relationOptions.map((relation) => (
                  <MenuItem key={relation} value={relation}>
                    {relation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mt: 2 }}>
            <TextField
              fullWidth
              label="聯絡人電話"
              value={formData.contact_phone}
              onChange={(e) => onInputChange('contact_phone', e.target.value)}
              sx={getValidationStyle(fieldErrors.contact_phone)}
              required
              placeholder="請輸入聯絡人電話"
            />
            
            <TextField
              fullWidth
              label="住家電話"
              value={formData.home_phone}
              onChange={(e) => onInputChange('home_phone', e.target.value)}
              sx={getValidationStyle(fieldErrors.home_phone)}
              placeholder="請輸入住家電話"
            />
          </Box>
        </Box>

        {/* 家庭資訊 */}
        <Box>
          <Typography variant="subtitle1" sx={{ 
            color: THEME_COLORS.TEXT_SECONDARY,
            fontWeight: 600,
            mb: 2,
            borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
            pb: 1,
          }}>
            家庭資訊
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField
              fullWidth
              label="家庭特殊情形"
              value={formData.family_status}
              onChange={(e) => onInputChange('family_status', e.target.value)}
              sx={getValidationStyle(fieldErrors.family_status)}
              placeholder="請描述家庭特殊情形"
            />
            
            <TextField
              fullWidth
              label="身分FQ／ICF編碼"
              value={formData.fq}
              onChange={(e) => onInputChange('fq', e.target.value)}
              sx={getValidationStyle(fieldErrors.fq)}
              placeholder="請輸入FQ/ICF編碼"
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mt: 2 }}>
            <TextField
              fullWidth
              label="家中成員說明"
              value={formData.family_members}
              onChange={(e) => onInputChange('family_members', e.target.value)}
              sx={getValidationStyle(fieldErrors.family_members)}
              placeholder="請描述家中成員"
            />
            
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.family_type)}>
              <InputLabel>家庭型態</InputLabel>
              <Select
                value={formData.family_type}
                onChange={(e) => onInputChange('family_type', e.target.value)}
                label="家庭型態"
                required
              >
                {familyTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mt: 2 }}>
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.parent_nation_father)}>
              <InputLabel>父親國籍</InputLabel>
              <Select
                value={formData.parent_nation_father}
                onChange={(e) => onInputChange('parent_nation_father', e.target.value)}
                label="父親國籍"
              >
                {nationOptions.map((nation) => (
                  <MenuItem key={nation} value={nation}>
                    {nation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.parent_nation_mother)}>
              <InputLabel>母親國籍</InputLabel>
              <Select
                value={formData.parent_nation_mother}
                onChange={(e) => onInputChange('parent_nation_mother', e.target.value)}
                label="母親國籍"
              >
                {nationOptions.map((nation) => (
                  <MenuItem key={nation} value={nation}>
                    {nation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="居住地區"
              value={formData.residence}
              onChange={(e) => onInputChange('residence', e.target.value)}
              sx={getValidationStyle(fieldErrors.residence)}
              placeholder="請輸入居住地區"
            />
          </Box>
        </Box>

        {/* 主要照顧者資訊 */}
        <Box>
          <Typography variant="subtitle1" sx={{ 
            color: THEME_COLORS.TEXT_SECONDARY,
            fontWeight: 600,
            mb: 2,
            borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
            pb: 1,
          }}>
            主要照顧者資訊
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField
              fullWidth
              label="主要照顧者姓名"
              value={formData.main_caregiver_name}
              onChange={(e) => onInputChange('main_caregiver_name', e.target.value)}
              sx={getValidationStyle(fieldErrors.main_caregiver_name)}
              placeholder="請輸入主要照顧者姓名"
            />
            
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.main_caregiver_relation)}>
              <InputLabel>與案主關係</InputLabel>
              <Select
                value={formData.main_caregiver_relation}
                onChange={(e) => onInputChange('main_caregiver_relation', e.target.value)}
                label="與案主關係"
              >
                {relationOptions.map((relation) => (
                  <MenuItem key={relation} value={relation}>
                    {relation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mt: 2 }}>
            <TextField
              fullWidth
              label="主要照顧者身分證字號"
              value={formData.main_caregiver_id}
              onChange={(e) => onInputChange('main_caregiver_id', e.target.value.toUpperCase())}
              sx={getValidationStyle(fieldErrors.main_caregiver_id)}
              placeholder="請輸入身分證字號"
              inputProps={{ maxLength: 10 }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="主要照顧者生日"
                value={formData.main_caregiver_birth}
                onChange={(value) => onDateChange('main_caregiver_birth', value)}
                sx={getDatePickerValidationStyle(fieldErrors.main_caregiver_birth)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: "YYYY/MM/DD",
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mt: 2 }}>
            <TextField
              fullWidth
              label="主要照顧者職業"
              value={formData.main_caregiver_job}
              onChange={(e) => onInputChange('main_caregiver_job', e.target.value)}
              sx={getValidationStyle(fieldErrors.main_caregiver_job)}
              placeholder="請輸入職業"
            />
            
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.main_caregiver_marry_status)}>
              <InputLabel>婚姻狀況</InputLabel>
              <Select
                value={formData.main_caregiver_marry_status}
                onChange={(e) => onInputChange('main_caregiver_marry_status', e.target.value)}
                label="婚姻狀況"
              >
                {marryStatusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.main_caregiver_edu)}>
              <InputLabel>教育程度</InputLabel>
              <Select
                value={formData.main_caregiver_edu}
                onChange={(e) => onInputChange('main_caregiver_edu', e.target.value)}
                label="教育程度"
              >
                {eduOptions.map((edu) => (
                  <MenuItem key={edu} value={edu}>
                    {edu}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* 個案來源與經驗 */}
        <Box>
          <Typography variant="subtitle1" sx={{ 
            color: THEME_COLORS.TEXT_SECONDARY,
            fontWeight: 600,
            mb: 2,
            borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
            pb: 1,
          }}>
            個案來源與經驗
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <FormControl fullWidth sx={getSelectValidationStyle(fieldErrors.source)}>
              <InputLabel>個案來源</InputLabel>
              <Select
                value={formData.source}
                onChange={(e) => onInputChange('source', e.target.value)}
                label="個案來源"
                required
              >
                {sourceOptions.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="求助經驗"
              value={formData.help_experience}
              onChange={(e) => onInputChange('help_experience', e.target.value)}
              sx={getValidationStyle(fieldErrors.help_experience)}
              placeholder="請描述求助經驗"
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="會談/輔導紀錄"
              value={formData.consultation}
              onChange={(e) => onInputChange('consultation', e.target.value)}
              sx={getValidationStyle(fieldErrors.consultation)}
              placeholder="請輸入會談或輔導紀錄"
              multiline
              rows={3}
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="備註"
              value={formData.note}
              onChange={(e) => onInputChange('note', e.target.value)}
              sx={getValidationStyle(fieldErrors.note)}
              placeholder="請輸入備註"
              multiline
              rows={4}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CaseDetailForm; 