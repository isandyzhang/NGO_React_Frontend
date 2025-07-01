import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  useTheme,
  TextField,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Autocomplete,
} from '@mui/material';
import { 
  Add,
  Remove,
  Warning,
  Person,
  Badge,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  commonStyles, 
  getValidationStyle, 
  getResponsiveSpacing,
  getSelectValidationStyle 
} from '../../styles/commonStyles';

interface EmergencySupplyRequestData {
  itemName: string;
  category: string;
  quantity: number;
  supplyType: 'emergency';
  caseName: string;
  caseId: string;
}

interface CaseRecord {
  id: string;
  name: string;
  age: number;
  contact: string;
  status: 'active' | 'inactive';
  lastUpdate: string;
}

const EmergencySupplyAddTab: React.FC = () => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState<EmergencySupplyRequestData>({
    itemName: '',
    category: '緊急醫療用品',
    quantity: 1,
    supplyType: 'emergency',
    caseName: '',
    caseId: '',
  });

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);

  // 模擬個案資料庫
  const [caseDatabase] = useState<CaseRecord[]>([
    {
      id: 'CASE001',
      name: '張小明',
      age: 65,
      contact: '0912-345-678',
      status: 'active',
      lastUpdate: '2024-01-15'
    },
    {
      id: 'CASE002', 
      name: '李小花',
      age: 72,
      contact: '0923-456-789',
      status: 'active',
      lastUpdate: '2024-01-14'
    },
    {
      id: 'CASE003',
      name: '王小華',
      age: 58,
      contact: '0934-567-890',
      status: 'active',
      lastUpdate: '2024-01-13'
    },
    {
      id: 'CASE004',
      name: '陳小美',
      age: 67,
      contact: '0945-678-901',
      status: 'inactive',
      lastUpdate: '2024-01-10'
    },
    {
      id: 'CASE005',
      name: '林小強',
      age: 55,
      contact: '0956-789-012',
      status: 'active',
      lastUpdate: '2024-01-16'
    },
    {
      id: 'CASE006',
      name: '黃小娟',
      age: 63,
      contact: '0967-890-123',
      status: 'active',
      lastUpdate: '2024-01-12'
    }
  ]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 清除該欄位的錯誤狀態
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handleCaseSelection = (newValue: CaseRecord | null) => {
    setSelectedCase(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        caseName: newValue.name,
        caseId: newValue.id,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        caseName: '',
        caseId: '',
      }));
    }
    
    // 清除個案相關的錯誤狀態
    if (fieldErrors.caseName || fieldErrors.caseId) {
      setFieldErrors(prev => ({
        ...prev,
        caseName: false,
        caseId: false
      }));
    }
  };

  const handleQuantityChange = (operation: 'add' | 'subtract') => {
    setFormData(prev => ({
      ...prev,
      quantity: operation === 'add' 
        ? prev.quantity + 1 
        : Math.max(1, prev.quantity - 1)
    }));
  };

  const handleSubmit = () => {
    // 驗證表單
    const errors: {[key: string]: boolean} = {};
    
    if (!formData.itemName.trim()) {
      errors.itemName = true;
    }
    
    // 緊急物資需要綁定個案
    if (!selectedCase) {
      errors.caseName = true;
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    console.log('緊急物資需求提交:', formData);
    // TODO: 實作物資需求提交邏輯
    alert(`緊急物資需求已成功提交！\n綁定個案：${selectedCase?.name} (${selectedCase?.id})`);
    
    // 重置表單
    setFormData({
      itemName: '',
      category: '緊急醫療用品',
      quantity: 1,
      supplyType: 'emergency',
      caseName: '',
      caseId: '',
    });
    setSelectedCase(null);
    setFieldErrors({});
  };

  const emergencyCategories = [
    '緊急醫療用品', '防護設備', '應急食品', '通訊設備',
    '照明設備', '救援工具', '臨時住所用品', '衛生用品', '其他緊急物資'
  ];

  return (
    <Paper elevation={1} sx={{ 
      ...commonStyles.formSection,
      width: '100%',
      p: getResponsiveSpacing('lg'),
      bgcolor: THEME_COLORS.ERROR_LIGHT,
      border: `1px solid ${THEME_COLORS.ERROR}`,
    }}>
      {/* 標題 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          p: 1.5,
          borderRadius: 2,
          bgcolor: THEME_COLORS.ERROR,
          color: 'white'
        }}>
          <Warning sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{
            ...commonStyles.formHeader,
            color: THEME_COLORS.ERROR,
            mb: 0.5
          }}>
            新增緊急物資需求
          </Typography>
          <Typography variant="body2" sx={{ 
            color: THEME_COLORS.TEXT_MUTED,
            fontSize: '0.875rem'
          }}>
            申請緊急情況下所需的物資和設備，需綁定個案
          </Typography>
        </Box>
      </Box>

      {/* 物資類型標籤 */}
      <Box sx={{ mb: 3 }}>
        <Chip
          label="緊急物資"
          color="error"
          variant="filled"
          icon={<Warning />}
          sx={{ 
            fontWeight: 600,
            px: 2,
            py: 1
          }}
        />
      </Box>

      {/* 表單區域 */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4,
        maxWidth: 600
      }}>
        
        {/* 個案綁定 */}
        <Box>
          <Typography variant="body1" sx={{ 
            ...commonStyles.formLabel,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Person sx={{ fontSize: 20, color: THEME_COLORS.ERROR }} />
            個案綁定 *
          </Typography>
          <Autocomplete
            value={selectedCase}
            onChange={(event, newValue) => handleCaseSelection(newValue)}
            options={caseDatabase}
            getOptionLabel={(option) => `${option.name} (${option.id})`}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: option.status === 'active' ? THEME_COLORS.SUCCESS : THEME_COLORS.DISABLED_BG,
                    color: 'white',
                    minWidth: 'max-content'
                  }}>
                    <Badge sx={{ fontSize: 16 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {option.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED, fontSize: '0.8rem' }}>
                      ID: {option.id} | 年齡: {option.age}歲 | 聯絡: {option.contact}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: option.status === 'active' ? THEME_COLORS.SUCCESS : THEME_COLORS.TEXT_MUTED,
                      fontSize: '0.75rem'
                    }}>
                      狀態: {option.status === 'active' ? '活躍' : '非活躍'} | 更新: {option.lastUpdate}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="輸入個案姓名或ID進行搜尋..."
                error={fieldErrors.caseName}
                sx={{
                  ...commonStyles.formInput,
                  ...getValidationStyle(fieldErrors.caseName)
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: THEME_COLORS.ERROR }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            filterOptions={(options, params) => {
              const filtered = options.filter(option => 
                option.name.toLowerCase().includes(params.inputValue.toLowerCase()) ||
                option.id.toLowerCase().includes(params.inputValue.toLowerCase())
              );
              return filtered;
            }}
            noOptionsText="找不到符合的個案"
            sx={{ width: '100%' }}
          />
          {selectedCase && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: THEME_COLORS.ERROR_LIGHT, 
              borderRadius: 2,
              border: `1px solid ${THEME_COLORS.ERROR}`
            }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                color: THEME_COLORS.ERROR,
                mb: 1
              }}>
                已選擇個案
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>姓名：</strong>{selectedCase.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>ID：</strong>{selectedCase.id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>年齡：</strong>{selectedCase.age}歲
              </Typography>
              <Typography variant="body2">
                <strong>聯絡方式：</strong>{selectedCase.contact}
              </Typography>
            </Box>
          )}
        </Box>

        {/* 物品名稱 */}
        <Box>
          <Typography variant="body1" sx={{ 
            ...commonStyles.formLabel,
            mb: 2
          }}>
            物品名稱 *
          </Typography>
          <TextField
            value={formData.itemName}
            onChange={(e) => handleInputChange('itemName', e.target.value)}
            fullWidth
            placeholder="請輸入緊急物資名稱"
            error={fieldErrors.itemName}
            sx={{
              ...commonStyles.formInput,
              ...getValidationStyle(fieldErrors.itemName)
            }}
          />
        </Box>

        {/* 物資分類 */}
        <FormControl fullWidth>
          <Typography variant="body1" sx={{ 
            ...commonStyles.formLabel,
            mb: 2
          }}>
            物資分類 *
          </Typography>
          <Select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            sx={{
              ...commonStyles.formSelect,
              ...getSelectValidationStyle(false)
            }}
          >
            {emergencyCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 數量 */}
        <Box>
          <Typography variant="body1" sx={{ 
            ...commonStyles.formLabel,
            mb: 2
          }}>
            數量 *
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            maxWidth: 300
          }}>
            {/* 減少按鈕 */}
            <Button 
              variant="outlined"
              onClick={() => handleQuantityChange('subtract')}
              sx={{ 
                minWidth: 48,
                height: 48,
                borderRadius: 2,
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': { 
                  bgcolor: 'action.hover',
                  borderColor: THEME_COLORS.ERROR
                }
              }}
            >
              <Remove />
            </Button>

            {/* 數量顯示 */}
            <TextField
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              type="number"
              sx={{ 
                width: 100,
                '& .MuiOutlinedInput-root': {
                  textAlign: 'center',
                  height: 48
                }
              }}
              inputProps={{ 
                min: 1, 
                max: 999,
                style: { textAlign: 'center' }
              }}
            />

            {/* 增加按鈕 */}
            <Button 
              variant="outlined"
              onClick={() => handleQuantityChange('add')}
              sx={{ 
                minWidth: 48,
                height: 48,
                borderRadius: 2,
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': { 
                  bgcolor: 'action.hover',
                  borderColor: THEME_COLORS.ERROR
                }
              }}
            >
              <Add />
            </Button>
          </Box>
        </Box>

        {/* 提交按鈕 */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'flex-end',
          mt: 2
        }}>
          <Button
            variant="outlined"
            onClick={() => {
              setFormData({
                itemName: '',
                category: '緊急醫療用品',
                quantity: 1,
                supplyType: 'emergency',
                caseName: '',
                caseId: '',
              });
              setSelectedCase(null);
              setFieldErrors({});
            }}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: THEME_COLORS.BORDER_DEFAULT,
              color: THEME_COLORS.TEXT_SECONDARY,
              '&:hover': {
                borderColor: THEME_COLORS.BORDER_DARK,
                bgcolor: THEME_COLORS.HOVER_LIGHT,
              }
            }}
          >
            重置
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: THEME_COLORS.ERROR,
              '&:hover': {
                bgcolor: THEME_COLORS.ERROR_DARK,
              }
            }}
          >
            提交需求
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EmergencySupplyAddTab; 