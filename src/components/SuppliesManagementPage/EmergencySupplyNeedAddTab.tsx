import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Avatar,
  IconButton,
  Paper,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { emergencySupplyNeedService, CreateEmergencySupplyNeedRequest } from '../../services/supplyManagement/emergencySupplyNeedService';
import { caseService } from '../../services/caseManagement/caseService';
import { THEME_COLORS } from '../../styles/theme';

interface CaseOption {
  caseId: number;
  name: string;
  identityNumber: string;
}

const EmergencySupplyNeedAddTab: React.FC = () => {
  const [formData, setFormData] = useState<CreateEmergencySupplyNeedRequest>({
    caseId: 0,
    workerId: 1, // 預設工作人員 ID
    supplyName: '',
    quantity: 1,
    description: '',
    priority: 'Normal',
    imageUrl: '',
  });

  const [cases, setCases] = useState<CaseOption[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseOption | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [casesLoading, setCasesLoading] = useState(true);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // 載入個案列表
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setCasesLoading(true);
      const casesData = await caseService.getAllCases();
      const caseOptions = casesData.data.map(caseItem => ({
        caseId: caseItem.caseId,
        name: caseItem.name,
        identityNumber: caseItem.identityNumber,
      }));
      setCases(caseOptions);
    } catch (error) {
      console.error('載入個案列表失敗:', error);
      showAlert('載入個案列表失敗', 'error');
    } finally {
      setCasesLoading(false);
    }
  };

  const showAlert = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleInputChange = (field: keyof CreateEmergencySupplyNeedRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCaseChange = (event: any, newValue: CaseOption | null) => {
    setSelectedCase(newValue);
    if (newValue) {
      handleInputChange('caseId', newValue.caseId);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 檢查檔案類型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showAlert('只支援 JPG、PNG、GIF 格式的圖片', 'error');
        return;
      }

      // 檢查檔案大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('圖片檔案大小不能超過 5MB', 'error');
        return;
      }

      setImageFile(file);
      
      // 建立預覽
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return '';

    try {
      setIsUploading(true);
      const imageUrl = await emergencySupplyNeedService.uploadImage(imageFile);
      handleInputChange('imageUrl', imageUrl);
      showAlert('圖片上傳成功', 'success');
      return imageUrl;
    } catch (error) {
      console.error('圖片上傳失敗:', error);
      showAlert('圖片上傳失敗', 'error');
      return '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    handleInputChange('imageUrl', '');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // 驗證必填欄位
    if (!formData.caseId) {
      showAlert('請選擇個案', 'error');
      return;
    }

    if (!formData.supplyName.trim()) {
      showAlert('請輸入物品名稱', 'error');
      return;
    }

    if (formData.quantity <= 0) {
      showAlert('數量必須大於 0', 'error');
      return;
    }

    try {
      setLoading(true);

      let finalImageUrl = formData.imageUrl;

      // 如果有圖片，先上傳圖片
      if (imageFile && !formData.imageUrl) {
        finalImageUrl = await handleImageUpload();
      }

      // 建立緊急物資需求，使用正確的圖片URL
      await emergencySupplyNeedService.create({
        ...formData,
        imageUrl: finalImageUrl
      });
      
      showAlert('緊急物資需求建立成功', 'success');
      
      // 重置表單
      setFormData({
        caseId: 0,
        workerId: 1,
        supplyName: '',
        quantity: 1,
        description: '',
        priority: 'Normal',
        imageUrl: '',
      });
      setSelectedCase(null);
      setImageFile(null);
      setImagePreview('');
      
    } catch (error) {
      console.error('建立緊急物資需求失敗:', error);
      showAlert('建立緊急物資需求失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      <Card>
        <CardContent>
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* 第一排：個案選擇 + 物品名稱 */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle1" sx={{ color: THEME_COLORS.TEXT_PRIMARY, mb: 1, fontWeight: 600 }}>
                    個案選擇 *
                  </Typography>
                  <Autocomplete
                    value={selectedCase}
                    onChange={handleCaseChange}
                    options={cases}
                    getOptionLabel={(option) => `${option.name} (${option.identityNumber})`}
                    loading={casesLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="請選擇需要物資的個案"
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {casesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle1" sx={{ color: THEME_COLORS.TEXT_PRIMARY, mb: 1, fontWeight: 600 }}>
                    物品名稱 *
                  </Typography>
                  <TextField
                    fullWidth
                    label="請輸入需要的物品名稱"
                    required
                    value={formData.supplyName}
                    onChange={(e) => handleInputChange('supplyName', e.target.value)}
                    placeholder="例如：嬰兒奶粉、輪椅、藥品等"
                  />
                </Box>
              </Box>

              {/* 第二排：數量 + 優先級 */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle1" sx={{ color: THEME_COLORS.TEXT_PRIMARY, mb: 1, fontWeight: 600 }}>
                    需求數量 *
                  </Typography>
                  <TextField
                    fullWidth
                    label="請輸入需要的數量"
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle1" sx={{ color: THEME_COLORS.TEXT_PRIMARY, mb: 1, fontWeight: 600 }}>
                    優先級 *
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>請選擇需求的優先級</InputLabel>
                    <Select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      label="請選擇需求的優先級"
                    >
                      <MenuItem value="Low">🟢 低 - 一般需求</MenuItem>
                      <MenuItem value="Normal">🟡 一般 - 正常需求</MenuItem>
                      <MenuItem value="High">🟠 高 - 重要需求</MenuItem>
                      <MenuItem value="Urgent">🔴 緊急 - 急需處理</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* 描述 */}
              <Box>
                <Typography variant="subtitle1" sx={{ color: THEME_COLORS.TEXT_PRIMARY, mb: 1, fontWeight: 600 }}>
                    需求描述
                </Typography>
                <TextField
                  fullWidth
                  label="請詳細描述物品規格、用途或特殊需求"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="請描述物品規格、用途或特殊需求..."
                />
              </Box>

              {/* 圖片上傳 */}
              <Box>
                <Typography variant="subtitle1" sx={{ color: THEME_COLORS.TEXT_PRIMARY, mb: 1, fontWeight: 600 }}>
                  物品圖片 (選填)
                </Typography>
                
                {imagePreview ? (
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={imagePreview}
                      sx={{ width: 100, height: 100 }}
                      variant="rounded"
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {imageFile?.name}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <IconButton
                          color="error"
                          onClick={handleRemoveImage}
                          disabled={isUploading}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ) : (
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="image-upload"
                      type="file"
                      onChange={handleImageSelect}
                    />
                    <label htmlFor="image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCamera />}
                        disabled={isUploading}
                      >
                        選擇圖片
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>

              {/* 提交按鈕 */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || isUploading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? '建立中...' : '建立需求'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* 提示訊息 */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmergencySupplyNeedAddTab; 