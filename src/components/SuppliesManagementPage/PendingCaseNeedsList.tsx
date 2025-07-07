import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Schedule,
  Warning,
  Edit,
  Refresh,
  CheckCircle,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

// 個案訪問記錄介面
interface CaseVisitRecord {
  id: string;
  caseName: string;
  caseId: string;
  visitDate: string;
  visitTime: string;
  visitStatus: 'completed' | 'pending' | 'cancelled';
  needsSubmitted: boolean;
  needsDeadline: string;
  daysOverdue?: number;
  casePhone?: string;
  caseAddress?: string;
  avatar?: string;
}

interface PendingCaseNeedsListProps {
  onSelectCase?: (caseId: string) => void;
}

/**
 * 待填寫個案需求列表組件
 * 
 * 功能：
 * 1. 顯示已完成行事曆個案訪問但還沒有寫入個案需求的人員
 * 2. 顯示截止日期和逾期天數
 * 3. 提供快速編輯個案需求的入口
 * 4. 自動刷新數據
 */
const PendingCaseNeedsList: React.FC<PendingCaseNeedsListProps> = ({ 
  onSelectCase 
}) => {
  const [pendingRecords, setPendingRecords] = useState<CaseVisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // 模擬數據 - 實際應用中會從 API 獲取
  const mockPendingRecords: CaseVisitRecord[] = [
    {
      id: 'V001',
      caseName: '張小明',
      caseId: 'CASE001',
      visitDate: '2024-01-15',
      visitTime: '09:00-11:00',
      visitStatus: 'completed',
      needsSubmitted: false,
      needsDeadline: '2024-01-17',
      daysOverdue: 2,
      casePhone: '0912-345-678',
      caseAddress: '台北市大安區信義路四段123號',
      avatar: undefined,
    },
    {
      id: 'V002',
      caseName: '李阿嬤',
      caseId: 'CASE002',
      visitDate: '2024-01-16',
      visitTime: '10:00-12:00',
      visitStatus: 'completed',
      needsSubmitted: false,
      needsDeadline: '2024-01-18',
      daysOverdue: 1,
      casePhone: '0923-456-789',
      caseAddress: '台北市中山區中山北路二段456號',
      avatar: undefined,
    },
    {
      id: 'V003',
      caseName: '王小華',
      caseId: 'CASE003',
      visitDate: '2024-01-17',
      visitTime: '14:00-16:00',
      visitStatus: 'completed',
      needsSubmitted: false,
      needsDeadline: '2024-01-19',
      daysOverdue: 0,
      casePhone: '0934-567-890',
      caseAddress: '台北市松山區南京東路三段789號',
      avatar: undefined,
    },
    {
      id: 'V004',
      caseName: '陳小美',
      caseId: 'CASE004',
      visitDate: '2024-01-18',
      visitTime: '15:00-17:00',
      visitStatus: 'completed',
      needsSubmitted: false,
      needsDeadline: '2024-01-20',
      daysOverdue: -1, // 還有1天
      casePhone: '0945-678-901',
      caseAddress: '台北市內湖區內湖路一段321號',
      avatar: undefined,
    },
  ];

  // 模擬 API 調用
  const fetchPendingRecords = async () => {
    setLoading(true);
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 計算逾期天數
      const today = new Date();
      const recordsWithOverdue = mockPendingRecords.map(record => {
        const deadline = new Date(record.needsDeadline);
        const timeDiff = today.getTime() - deadline.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return {
          ...record,
          daysOverdue: daysDiff,
        };
      });
      
      setPendingRecords(recordsWithOverdue);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('獲取待填寫個案需求列表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRecords();
  }, []);

  // 手動刷新
  const handleRefresh = () => {
    fetchPendingRecords();
  };

  // 快速編輯個案需求
  const handleEditNeeds = (record: CaseVisitRecord) => {
    // 調用回調函數，將 CASE ID 傳遞給父組件
    if (onSelectCase) {
      onSelectCase(record.caseId);
    }
  };

  // 獲取逾期狀態顏色
  const getOverdueColor = (daysOverdue: number) => {
    if (daysOverdue > 0) return THEME_COLORS.ERROR; // 已逾期
    if (daysOverdue === 0) return THEME_COLORS.WARNING; // 今天到期
    return THEME_COLORS.SUCCESS; // 未到期
  };

  // 獲取逾期狀態文字
  const getOverdueText = (daysOverdue: number) => {
    if (daysOverdue > 0) return `逾期 ${daysOverdue} 天`;
    if (daysOverdue === 0) return '今天到期';
    return `還有 ${Math.abs(daysOverdue)} 天`;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <Paper sx={{ 
      p: 3, 
      height: 'fit-content',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}>
      {/* 標題區域 */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ 
            fontSize: 20, 
            color: THEME_COLORS.WARNING,
          }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: THEME_COLORS.TEXT_PRIMARY,
          }}>
            待填寫個案需求
          </Typography>
        </Box>
        <Tooltip title="重新整理">
          <IconButton 
            onClick={handleRefresh}
            disabled={loading}
            sx={{ 
              color: THEME_COLORS.PRIMARY,
              '&:hover': {
                bgcolor: `${THEME_COLORS.PRIMARY}14`,
              },
            }}
          >
            <Refresh sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 說明文字 */}
      <Typography variant="body2" sx={{ 
        color: THEME_COLORS.TEXT_MUTED,
        mb: 2,
        fontSize: '0.875rem',
      }}>
        顯示已完成行事曆個案訪問但尚未填寫個案需求的記錄
      </Typography>

      {/* 最後更新時間 */}
      <Typography variant="caption" sx={{ 
        color: THEME_COLORS.TEXT_MUTED,
        mb: 3,
        display: 'block',
      }}>
        最後更新：{lastRefresh.toLocaleTimeString('zh-TW')}
      </Typography>

      {/* 列表內容 */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4,
        }}>
          <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_MUTED }}>
            載入中...
          </Typography>
        </Box>
      ) : pendingRecords.length === 0 ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            太棒了！目前沒有待填寫的個案需求
          </Typography>
        </Alert>
      ) : (
        <>
          {/* 統計資訊 */}
          <Box sx={{ mb: 2 }}>
            <Alert 
              severity="warning" 
              sx={{ 
                bgcolor: `${THEME_COLORS.WARNING}14`,
                border: `1px solid ${THEME_COLORS.WARNING}`,
              }}
            >
              <Typography variant="body2">
                共有 <strong>{pendingRecords.length}</strong> 筆待填寫記錄，
                其中 <strong>{pendingRecords.filter(r => (r.daysOverdue ?? 0) > 0).length}</strong> 筆已逾期
              </Typography>
            </Alert>
          </Box>

          {/* 個案列表 */}
          <List sx={{ p: 0 }}>
            {pendingRecords.map((record, index) => (
              <React.Fragment key={record.id}>
                <ListItem sx={{ 
                  px: 0, 
                  py: 2,
                  alignItems: 'flex-start',
                }}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: THEME_COLORS.PRIMARY,
                      width: 40,
                      height: 40,
                    }}>
                      <Person sx={{ fontSize: 20 }} />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        mb: 0.5,
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600,
                          color: THEME_COLORS.TEXT_PRIMARY,
                        }}>
                          {record.caseName}
                        </Typography>
                        <Chip
                          label={record.caseId}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.75rem',
                            bgcolor: `${THEME_COLORS.PRIMARY}14`,
                            color: THEME_COLORS.PRIMARY,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" sx={{ 
                          color: THEME_COLORS.TEXT_MUTED,
                          fontSize: '0.875rem',
                          mb: 0.5,
                        }}>
                          <Schedule sx={{ fontSize: 14, mr: 0.5 }} />
                          訪問時間：{formatDate(record.visitDate)} {record.visitTime}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          mb: 1,
                        }}>
                                                     <Chip
                             label={getOverdueText(record.daysOverdue ?? 0)}
                             size="small"
                             sx={{
                               height: 22,
                               fontSize: '0.75rem',
                               bgcolor: `${getOverdueColor(record.daysOverdue ?? 0)}14`,
                               color: getOverdueColor(record.daysOverdue ?? 0),
                               fontWeight: 500,
                             }}
                           />
                          <Typography variant="caption" sx={{ 
                            color: THEME_COLORS.TEXT_MUTED,
                          }}>
                            截止：{formatDate(record.needsDeadline)}
                          </Typography>
                        </Box>

                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit sx={{ fontSize: 16 }} />}
                          onClick={() => handleEditNeeds(record)}
                          sx={{
                            borderColor: THEME_COLORS.PRIMARY,
                            color: THEME_COLORS.PRIMARY,
                            fontSize: '0.75rem',
                            px: 2,
                            py: 0.5,
                            '&:hover': {
                              borderColor: THEME_COLORS.PRIMARY_DARK,
                              bgcolor: `${THEME_COLORS.PRIMARY}14`,
                            },
                          }}
                        >
                          填寫需求
                        </Button>
                      </Box>
                    }
                  />
                </ListItem>
                
                {index < pendingRecords.length - 1 && (
                  <Divider sx={{ my: 1 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default PendingCaseNeedsList; 