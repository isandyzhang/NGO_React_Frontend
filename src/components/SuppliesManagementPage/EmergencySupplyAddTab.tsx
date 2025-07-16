import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  useTheme,
  TextField,
  Paper,
  Button,
  InputAdornment,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
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
  getResponsiveSpacing
} from '../../styles/commonStyles';
import { caseService, CaseResponse } from '../../services/caseService';
import { supplyService, Supply } from '../../services/supplyService';

interface EmergencySupplyRequestData {
  supplyId: string;
  itemName: string;
  quantity: number;
  supplyType: 'emergency';
  caseName: string;
  caseId: string;
}

interface CaseRecord {
  id: string;
  name: string;
  age?: number;
  contact: string;
  status: 'active' | 'inactive';
  lastUpdate: string;
}

const EmergencySupplyAddTab: React.FC = () => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState<EmergencySupplyRequestData>({
    supplyId: '',
    itemName: '',
    quantity: 1,
    supplyType: 'emergency',
    caseName: '',
    caseId: '',
  });

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [caseDatabase, setCaseDatabase] = useState<CaseRecord[]>([]);
  const [suppliesDatabase, setSuppliesDatabase] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 載入個案資料
  const loadCaseData = async () => {
    try {
      const response = await caseService.getAllCases(1, 100); // 獲取前100個個案
      const caseRecords: CaseRecord[] = response.data.map((caseItem: CaseResponse) => ({
        id: caseItem.caseId.toString(),
        name: caseItem.name,
        age: caseItem.birthday ? new Date().getFullYear() - new Date(caseItem.birthday).getFullYear() : undefined,
        contact: caseItem.phone,
        status: caseItem.status === 'active' ? 'active' : 'inactive',
        lastUpdate: new Date(caseItem.createdAt).toISOString().split('T')[0]
      }));
      setCaseDatabase(caseRecords);
    } catch (error) {
      console.error('載入個案資料失敗:', error);
    }
  };

  // 載入物資資料
  const loadSuppliesData = async () => {
    try {
      const response = await supplyService.getSupplies();
      setSuppliesDatabase(response);
    } catch (error) {
      console.error('載入物資資料失敗:', error);
    }
  };

  // 組件載入時獲取個案和物資資料
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadCaseData(), loadSuppliesData()]);
      } catch (error) {
        console.error('載入資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 自動清除成功消息
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000); // 5秒後清除成功消息
      return () => clearTimeout(timer);
    }
  }, [success]);



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

  const handleSupplySelection = (newValue: Supply | null) => {
    setSelectedSupply(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        supplyId: newValue.supplyId.toString(),
        itemName: newValue.name,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        supplyId: '',
        itemName: '',
      }));
    }
    
    // 清除物資相關的錯誤狀態
    if (fieldErrors.itemName || fieldErrors.supplyId) {
      setFieldErrors(prev => ({
        ...prev,
        itemName: false,
        supplyId: false
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

  const handleSubmit = async () => {
    // 清除之前的訊息
    setError(null);
    setSuccess(null);
    
    // 驗證表單
    const errors: {[key: string]: boolean} = {};
    
    if (!selectedSupply) {
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

    setSubmitting(true);
    
    try {
      // 準備API請求資料
      const requestData = {
        caseId: selectedCase!.id,
        caseName: selectedCase!.name,
        itemName: formData.itemName,
        quantity: formData.quantity,
        unit: '個',
        requestedBy: 'Admin', // 這裡應該從用戶登入狀態獲取
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        estimatedCost: 0,
        matched: false,
        emergencyReason: '緊急需求'
      };

      // 調用API創建緊急物資需求
      await supplyService.createEmergencySupplyNeed(requestData);
      
      // 成功提示
      setSuccess(`緊急物資需求已成功提交！物品：${formData.itemName}，數量：${formData.quantity}，綁定個案：${selectedCase?.name} (${selectedCase?.id})`);
      
      // 重置表單
      setFormData({
        supplyId: '',
        itemName: '',
        quantity: 1,
        supplyType: 'emergency',
        caseName: '',
        caseId: '',
      });
      setSelectedCase(null);
      setSelectedSupply(null);
      setFieldErrors({});
      
    } catch (error) {
      console.error('提交緊急物資需求失敗:', error);
      setError('提交失敗，請檢查網路連接或稍後再試');
    } finally {
      setSubmitting(false);
    }
  };



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

      {/* 錯誤和成功消息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

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
                        ID: {option.id} | {option.age ? `年齡: ${option.age}歲` : '年齡: 未知'} | 聯絡: {option.contact}
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
                  <strong>年齡：</strong>{selectedCase.age ? `${selectedCase.age}歲` : '未知'}
                </Typography>
              <Typography variant="body2">
                <strong>聯絡方式：</strong>{selectedCase.contact}
              </Typography>
            </Box>
          )}
        </Box>

        {/* 物品選擇 */}
        <Box>
          <Typography variant="body1" sx={{ 
            ...commonStyles.formLabel,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            物品選擇 *
          </Typography>
          <Autocomplete
            value={selectedSupply}
            onChange={(event, newValue) => handleSupplySelection(newValue)}
            options={suppliesDatabase}
            getOptionLabel={(option) => `${option.name} - $${option.cost}`}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {option.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED, fontSize: '0.8rem' }}>
                      庫存: {option.currentStock} {option.unit} | 位置: {option.location}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: THEME_COLORS.SUCCESS,
                      fontSize: '0.75rem'
                    }}>
                      成本: ${option.cost} | 供應商: {option.supplier}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="選擇物資..."
                error={fieldErrors.itemName}
                sx={{
                  ...commonStyles.formInput,
                  ...getValidationStyle(fieldErrors.itemName)
                }}
              />
            )}
            filterOptions={(options, params) => {
              const filtered = options.filter(option => 
                option.name.toLowerCase().includes(params.inputValue.toLowerCase())
              );
              return filtered;
            }}
            noOptionsText="找不到符合的物資"
            sx={{ width: '100%' }}
          />
          {selectedSupply && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: THEME_COLORS.SUCCESS_LIGHT, 
              borderRadius: 2,
              border: `1px solid ${THEME_COLORS.SUCCESS}`
            }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                color: THEME_COLORS.SUCCESS,
                mb: 1
              }}>
                已選擇物資
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>名稱：</strong>{selectedSupply.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>成本：</strong>${selectedSupply.cost}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>庫存：</strong>{selectedSupply.currentStock} {selectedSupply.unit}
              </Typography>
              <Typography variant="body2">
                <strong>位置：</strong>{selectedSupply.location}
              </Typography>
            </Box>
          )}
        </Box>



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
                supplyId: '',
                itemName: '',
                quantity: 1,
                supplyType: 'emergency',
                caseName: '',
                caseId: '',
              });
                    setSelectedCase(null);
      setSelectedSupply(null);
      setFieldErrors({});
      setError(null);
      setSuccess(null);
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
            disabled={submitting}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: THEME_COLORS.ERROR,
              '&:hover': {
                bgcolor: THEME_COLORS.ERROR_DARK,
              },
              '&:disabled': {
                bgcolor: THEME_COLORS.DISABLED_BG,
              }
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                提交中...
              </>
            ) : (
              '提交需求'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EmergencySupplyAddTab; 