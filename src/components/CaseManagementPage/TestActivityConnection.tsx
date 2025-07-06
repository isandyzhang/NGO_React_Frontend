import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import activityService from '../../services/activityService';
import { THEME_COLORS } from '../../styles/theme';

const TestActivityConnection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActivities([]);

    try {
      // 測試資料庫連接
      const testResult = await activityService.getActivityStatistics();
      setResult(testResult);

      // 獲取活動列表
      const activitiesResponse = await activityService.getActivities();
      setActivities(activitiesResponse.activities);

      console.log('活動API測試成功:', testResult);
      console.log('活動列表:', activitiesResponse.activities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '測試失敗';
      setError(errorMessage);
      console.error('活動API測試失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, color: THEME_COLORS.TEXT_PRIMARY }}>
        活動API連接測試
      </Typography>

      <Button
        variant="contained"
        onClick={testConnection}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
        sx={{ mb: 3, bgcolor: THEME_COLORS.PRIMARY }}
      >
        {loading ? '測試中...' : '測試活動API連接'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Card sx={{ mb: 3, bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: THEME_COLORS.TEXT_PRIMARY }}>
              活動統計資料
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">總活動數</Typography>
                <Typography variant="h4" color="primary">{result.totalActivities}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">進行中</Typography>
                <Typography variant="h4" color="primary">{result.activeActivities}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">已完成</Typography>
                <Typography variant="h4" color="primary">{result.completedActivities}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">已取消</Typography>
                <Typography variant="h4" color="primary">{result.cancelledActivities}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {activities.length > 0 && (
        <Card sx={{ bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: THEME_COLORS.TEXT_PRIMARY }}>
              活動列表 ({activities.length} 個)
            </Typography>
            <List>
              {activities.map((activity, index) => (
                <React.Fragment key={activity.activityId}>
                  <ListItem>
                    <ListItemText
                      primary={activity.activityName}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            地點: {activity.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            開始時間: {new Date(activity.startDate).toLocaleString('zh-TW')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            參與人數: {activity.currentParticipants}/{activity.maxParticipants}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            狀態: {activity.status}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TestActivityConnection; 