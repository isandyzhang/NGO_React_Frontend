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
} from '@mui/material';
import { 
  Inventory,
  Add,
  Remove,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { 
  commonStyles, 
  getValidationStyle, 
  getResponsiveSpacing,
  getSelectValidationStyle 
} from '../../styles/commonStyles';

interface SupplyRequestData {
  itemName: string;
  category: string;
  quantity: number;
}

const AddSupplyRequestTab: React.FC = () => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState<SupplyRequestData>({
    itemName: '',
    category: '辦公用品',
    quantity: 1,
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

    console.log('物資需求提交:', formData);
    // TODO: 實作物資需求提交邏輯
    alert('物資需求已成功提交！');
    
    // 重置表單
    setFormData({
      itemName: '',
      category: '辦公用品',
      quantity: 1,
    });
    setFieldErrors({});
  };

  // 物資類別選項
  const categories = [
    '辦公用品', '清潔用品', '食物飲料', '醫療用品', 
    '教學用品', '電子設備', '家具設備', '活動用品', '其他'
  ];

  return (
    <Paper elevation={1} sx={{ 
      ...commonStyles.formSection,
      width: '100%',
      p: getResponsiveSpacing('lg')
    }}>
      {/* 標題 */}
      <Typography variant="h5" sx={{
        ...commonStyles.formHeader,
        mb: 4
      }}>
        新增物資需求
      </Typography>

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
            {categories.map((category) => (
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
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 120,
              height: 48,
              border: `2px solid ${theme.palette.divider}`,
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}>
                {formData.quantity}
              </Typography>
            </Box>

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
          justifyContent: 'flex-start', 
          mt: 6 
        }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<Inventory />}
            disabled={!formData.itemName.trim()}
            sx={{
              ...commonStyles.primaryButton,
              px: 8,
              py: 2.5,
              fontSize: '1.1rem',
              borderRadius: 3
            }}
          >
            提交需求
          </Button>
        </Box>

        {/* 必填欄位說明 */}
        <Typography variant="body2" sx={{ 
          color: 'text.secondary',
          fontStyle: 'italic',
          mt: 2
        }}>
          * 為必填欄位
        </Typography>
      </Box>
    </Paper>
  );
};

export default AddSupplyRequestTab; 