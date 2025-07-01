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
  Chip,
} from '@mui/material';
import { 
  Add,
  Remove,
  Home,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  commonStyles, 
  getValidationStyle, 
  getResponsiveSpacing,
  getSelectValidationStyle 
} from '../../styles/commonStyles';

interface RegularSupplyRequestData {
  itemName: string;
  category: string;
  quantity: number;
  supplyType: 'regular';
}

const RegularSupplyAddTab: React.FC = () => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState<RegularSupplyRequestData>({
    itemName: '',
    category: '辦公用品',
    quantity: 1,
    supplyType: 'regular',
  });

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});

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
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    console.log('常駐物資需求提交:', formData);
    // TODO: 實作物資需求提交邏輯
    alert('常駐物資需求已成功提交！');
    
    // 重置表單
    setFormData({
      itemName: '',
      category: '辦公用品',
      quantity: 1,
      supplyType: 'regular',
    });
    setFieldErrors({});
  };

  const regularCategories = [
    '辦公用品', '清潔用品', '食物飲料', '醫療用品', 
    '教學用品', '電子設備', '家具設備', '活動用品', '其他'
  ];

  return (
    <Paper elevation={1} sx={{ 
      ...commonStyles.formSection,
      width: '100%',
      p: getResponsiveSpacing('lg'),
      bgcolor: THEME_COLORS.BACKGROUND_CARD,
      border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
    }}>
      {/* 標題 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          p: 1.5,
          borderRadius: 2,
          bgcolor: THEME_COLORS.PRIMARY,
          color: 'white'
        }}>
          <Home sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{
            ...commonStyles.formHeader,
            color: THEME_COLORS.PRIMARY,
            mb: 0.5
          }}>
            新增常駐物資需求
          </Typography>
          <Typography variant="body2" sx={{ 
            color: THEME_COLORS.TEXT_MUTED,
            fontSize: '0.875rem'
          }}>
            申請日常運營所需的常規物資和設備
          </Typography>
        </Box>
      </Box>

      {/* 物資類型標籤 */}
      <Box sx={{ mb: 3 }}>
        <Chip
          label="常駐物資"
          color="primary"
          variant="filled"
          icon={<Home />}
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
            placeholder="請輸入物品名稱"
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
            {regularCategories.map((category) => (
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
                  borderColor: THEME_COLORS.PRIMARY_DARK
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
                  borderColor: THEME_COLORS.PRIMARY_DARK
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
                category: '辦公用品',
                quantity: 1,
                supplyType: 'regular',
              });
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
              bgcolor: THEME_COLORS.PRIMARY,
              '&:hover': {
                bgcolor: THEME_COLORS.PRIMARY_DARK,
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

export default RegularSupplyAddTab; 