import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Refresh, CheckCircle, Error } from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { caseService } from '../../services/caseService';

const TestConnection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    connection: any;
    getAllCases: any;
    searchCases: any;
    createCase: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      const results: {
        connection: any;
        getAllCases: any;
        searchCases: any;
        createCase: any;
      } = {
        connection: null,
        getAllCases: null,
        searchCases: null,
        createCase: null
      };

      // 測試資料庫連接
      try {
        results.connection = await caseService.testConnection();
        console.log('資料庫連接測試成功:', results.connection);
      } catch (err) {
        results.connection = { error: err instanceof Error ? err.message : '未知錯誤' };
        console.error('資料庫連接測試失敗:', err);
      }

      // 測試獲取所有個案
      try {
        results.getAllCases = await caseService.getAllCases();
        console.log('獲取所有個案測試成功:', results.getAllCases);
      } catch (err) {
        results.getAllCases = { error: err instanceof Error ? err.message : '未知錯誤' };
        console.error('獲取所有個案測試失敗:', err);
      }

      // 測試搜尋個案
      try {
        results.searchCases = await caseService.searchCases({ query: '張', page: 1, pageSize: 5 });
        console.log('搜尋個案測試成功:', results.searchCases);
      } catch (err) {
        results.searchCases = { error: err instanceof Error ? err.message : '未知錯誤' };
        console.error('搜尋個案測試失敗:', err);
      }

      setTestResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '測試過程中發生錯誤');
      console.error('測試錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTestStatus = (result: any) => {
    if (!result) return { status: 'pending', text: '未測試', color: 'text.secondary' };
    if (result.error) return { status: 'error', text: '失敗', color: THEME_COLORS.ERROR };
    return { status: 'success', text: '成功', color: THEME_COLORS.SUCCESS };
  };

  const getResultMessage = (result: any) => {
    if (!result) return '';
    if (result.error) return result.error;
    if (result.message) return result.message;
    return '';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
          個案管理 API 測試
        </Typography>
        <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED, mb: 3 }}>
          測試前後端整合是否正常運作
        </Typography>
        
        <Button
          variant="contained"
          onClick={runTests}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
          sx={{ bgcolor: THEME_COLORS.PRIMARY }}
        >
          {loading ? '測試中...' : '執行測試'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {testResults && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
            測試結果
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">資料庫連接測試</Typography>
                    {getTestStatus(testResults.connection).status === 'success' && <CheckCircle sx={{ color: THEME_COLORS.SUCCESS }} />}
                    {getTestStatus(testResults.connection).status === 'error' && <Error sx={{ color: THEME_COLORS.ERROR }} />}
                  </Box>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{ color: getTestStatus(testResults.connection).color }}
                  >
                    {getTestStatus(testResults.connection).text}
                    {getResultMessage(testResults.connection) && ` - ${getResultMessage(testResults.connection)}`}
                    {testResults.connection?.totalCases && ` (共 ${testResults.connection.totalCases} 個個案)`}
                  </Typography>
                }
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">獲取所有個案</Typography>
                    {getTestStatus(testResults.getAllCases).status === 'success' && <CheckCircle sx={{ color: THEME_COLORS.SUCCESS }} />}
                    {getTestStatus(testResults.getAllCases).status === 'error' && <Error sx={{ color: THEME_COLORS.ERROR }} />}
                  </Box>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{ color: getTestStatus(testResults.getAllCases).color }}
                  >
                    {getTestStatus(testResults.getAllCases).text}
                    {testResults.getAllCases?.length && ` (共 ${testResults.getAllCases.length} 個個案)`}
                  </Typography>
                }
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">搜尋個案</Typography>
                    {getTestStatus(testResults.searchCases).status === 'success' && <CheckCircle sx={{ color: THEME_COLORS.SUCCESS }} />}
                    {getTestStatus(testResults.searchCases).status === 'error' && <Error sx={{ color: THEME_COLORS.ERROR }} />}
                  </Box>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{ color: getTestStatus(testResults.searchCases).color }}
                  >
                    {getTestStatus(testResults.searchCases).text}
                    {testResults.searchCases?.data && ` (找到 ${testResults.searchCases.data.length} 個個案，總計 ${testResults.searchCases.total} 個)`}
                  </Typography>
                }
              />
            </ListItem>
          </List>

          {testResults.getAllCases?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                個案列表預覽 (前 5 個)
              </Typography>
              <List dense>
                {testResults.getAllCases.slice(0, 5).map((caseItem: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${caseItem.name} (${caseItem.gender})`}
                      secondary={`${caseItem.phone} - ${caseItem.description}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default TestConnection; 