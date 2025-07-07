import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Button,
  Alert,
} from '@mui/material';
import { THEME_COLORS } from '../../styles/theme';
import CaseRegistrationReview from './CaseRegistrationReview';
import PublicRegistrationReview from './PublicRegistrationReview';
import registrationService from '../../services/registrationService';

const RegistrationReviewMain: React.FC = () => {
  const [showPublicReview, setShowPublicReview] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowPublicReview(event.target.checked);
  };

  const testAPI = async () => {
    try {
      setDebugInfo('測試中...');
      
      // 測試個案報名 API
      const caseData = await registrationService.getCaseRegistrations();
      
      // 測試民眾報名 API
      const publicData = await registrationService.getPublicRegistrations();
      
      setDebugInfo(`個案報名: ${Array.isArray(caseData) ? caseData.length : '非陣列'} 筆，民眾報名: ${Array.isArray(publicData) ? publicData.length : '非陣列'} 筆`);
    } catch (error) {
      console.error('API 測試失敗:', error);
      setDebugInfo(`錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 頁面標題和切換開關 */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" sx={{ color: THEME_COLORS.PRIMARY, fontWeight: 600 }}>
            報名審核管理
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" size="small" onClick={testAPI}>
              測試 API
            </Button>
            <FormControlLabel
              control={
                <Switch
                  checked={showPublicReview}
                  onChange={handleSwitchChange}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: THEME_COLORS.PRIMARY,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: THEME_COLORS.PRIMARY,
                    },
                  }}
                />
              }
              label={
                <Typography variant="h6" sx={{ color: THEME_COLORS.TEXT_PRIMARY, fontWeight: 500 }}>
                  {showPublicReview ? '民眾審核' : '個案審核'}
                </Typography>
              }
              labelPlacement="start"
            />
          </Box>
        </Box>
      </Paper>

      {/* 除錯資訊 */}
      {debugInfo && (
        <Alert severity={debugInfo.includes('錯誤') ? 'error' : 'info'} sx={{ mb: 2 }}>
          {debugInfo}
        </Alert>
      )}

      {/* 根據開關狀態顯示不同的審核頁面 */}
      {showPublicReview ? <PublicRegistrationReview /> : <CaseRegistrationReview />}
    </Box>
  );
};

export default RegistrationReviewMain; 