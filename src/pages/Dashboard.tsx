import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card,
  CardContent, 
  Typography, 
  useTheme,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Chip
} from '@mui/material';
import { PieChart, BarChart } from '@mui/x-charts';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import { CalendarEvent } from '../services/scheduleService';
import { calendarService, caseService, activityService, authService } from '../services';
import { 
  People, 
  Assignment, 
  NotificationsNone,
  CalendarToday,
  Info,
  Dashboard as DashboardIcon,
  TrendingUp
} from '@mui/icons-material';
import { THEME_COLORS } from '../styles/theme';
import { commonStyles } from '../styles/commonStyles';
import { formatDate as formatDateHelper, isToday, isTomorrow } from '../utils/dateHelper';

/**
 * 儀表板頁面組件
 * 
 * 主要功能：
 * 1. 顯示系統總覽統計資料（個案人數、志工人數等）
 * 2. 展示各種圖表分析（性別分布、地區分析、學校分布等）
 * 3. 提供通知管理功能
 * 4. 顯示系統資訊（日期、版本）
 * 
 * 這是用戶登入後看到的主要頁面，提供整個案件管理系統的概覽視圖
 */
const Dashboard: React.FC = () => {
  const theme = useTheme();
  
  // 通知選單的錨點元素狀態
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  
  // 最近行事曆活動狀態
  const [recentEvents, setRecentEvents] = useState<CalendarEvent[]>([]);
  
  // 模擬通知資料 - 主要為活動相關通知
  const notifications = [
    { id: 1, title: '【個案活動】雜貨旅遊甜點體驗營報名開始', time: '2分鐘前', type: 'info' },
    { id: 2, title: '【志工活動】環保淨灘活動需要更多志工', time: '15分鐘前', type: 'warning' },
    { id: 3, title: '【個案訪問】張小明個案訪問已完成', time: '1小時前', type: 'success' },
    { id: 4, title: '【活動提醒】青少年職涯探索工作坊明日開始', time: '2小時前', type: 'warning' },
    { id: 5, title: '【志工培訓】新志工培訓課程開放報名', time: '3小時前', type: 'info' },
    { id: 6, title: '【個案活動】長者數位學習課程報名額滿', time: '4小時前', type: 'success' },
    { id: 7, title: '【活動取消】因天候因素戶外活動延期', time: '5小時前', type: 'warning' },
    { id: 8, title: '【志工活動】社區關懷訪問活動圓滿結束', time: '6小時前', type: 'success' }
  ];

  /**
   * 處理通知鈴鐺點擊事件
   * 顯示通知下拉選單
   */
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  /**
   * 關閉通知選單
   */
  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  // 取得今日日期
  const today = new Date();
  
  /**
   * 格式化日期顯示
   * @param date - 要格式化的日期物件
   * @returns 格式化後的中文日期字串
   */
  const formatDate = (date: Date) => {
    return formatDateHelper(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 系統版本資訊
  const systemVersion = 'v1.2.3';

  // 統計卡片資料 - 使用真實資料
  const [statsCards, setStatsCards] = useState([
    {
      title: '個案人數',
      value: '0',
      icon: <Assignment />,
      color: THEME_COLORS.CHART_PRIMARY
    },
    {
      title: '志工人數',
      value: '0',
      icon: <People />,
      color: THEME_COLORS.CHART_SECONDARY
    },
    {
      title: '活動總數',
      value: '0',
      icon: <CalendarToday />,
      color: THEME_COLORS.CHART_ACCENT_1
    },
    {
      title: '本月完成活動',
      value: '0',
      icon: <TrendingUp />,
      color: THEME_COLORS.CHART_ACCENT_2
    }
  ]);

  // 性別分布統計資料（圓餅圖用）
  const genderData = [
    { id: 0, value: 89, label: '男生' },
    { id: 1, value: 67, label: '女生' }
  ];



  // 全台灣個案分布資料（長條圖用）
  const regionDistributionData = [
    { region: '台北市', count: 45 },
    { region: '新北市', count: 38 },
    { region: '桃園市', count: 28 },
    { region: '台中市', count: 22 },
    { region: '台南市', count: 18 },
    { region: '高雄市', count: 15 },
    { region: '新竹縣', count: 12 },
    { region: '彰化縣', count: 10 },
    { region: '基隆市', count: 8 },
    { region: '宜蘭縣', count: 6 },
    { region: '雲林縣', count: 5 },
    { region: '其他', count: 9 }
  ];

  // 事件類型配置 - 使用新的圖表顏色
  const eventTypes = {
    meeting: { label: '會議', color: THEME_COLORS.CHART_SECONDARY },
    activity: { label: '活動', color: THEME_COLORS.CHART_PRIMARY },
    'case-visit': { label: '個案訪問', color: THEME_COLORS.CHART_ACCENT_1 },
    training: { label: '培訓', color: THEME_COLORS.CHART_ACCENT_2 },
    other: { label: '其他', color: THEME_COLORS.CHART_NEUTRAL },
  };

  /**
   * 載入最近的行事曆活動
   */
  const loadRecentEvents = async () => {
    try {
      const allEvents = await calendarService.getAllEvents();
      const now = new Date();
      
      // 篩選未來7天內的活動，並按日期排序
      const upcomingEvents = allEvents
        .filter(event => {
          const eventDate = new Date(event.start);
          const diffTime = eventDate.getTime() - now.getTime();
          const diffDays = diffTime / (1000 * 3600 * 24);
          return diffDays >= 0 && diffDays <= 7; // 未來7天內
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 5); // 只取前5個
      
      setRecentEvents(upcomingEvents);
    } catch (error) {
      console.error('載入行事曆活動失敗:', error);
    }
  };

  // 載入統計資料
  const loadStatistics = async () => {
    try {
      // 載入個案統計
      const cases = await caseService.getAllCases();
      
      // 載入志工統計
      const workers = await authService.getWorkers();
      
      // 載入活動統計
      const activityStats = await activityService.getActivityStatistics();
      
      // 更新統計卡片
      setStatsCards([
        {
          title: '個案人數',
          value: cases.length.toString(),
          icon: <Assignment />,
          color: THEME_COLORS.CHART_PRIMARY
        },
        {
          title: '志工人數',
          value: workers.length.toString(),
          icon: <People />,
          color: THEME_COLORS.CHART_SECONDARY
        },
        {
          title: '活動總數',
          value: activityStats.totalActivities.toString(),
          icon: <CalendarToday />,
          color: THEME_COLORS.CHART_ACCENT_1
        },
        {
          title: '本月完成活動',
          value: activityStats.completedActivities.toString(),
          icon: <TrendingUp />,
          color: THEME_COLORS.CHART_ACCENT_2
        }
      ]);
    } catch (error) {
      console.error('載入統計資料失敗:', error);
    }
  };

  // 組件載入時載入資料
  useEffect(() => {
    loadRecentEvents();
    loadStatistics();
  }, []);

  /**
   * 格式化事件日期時間
   */
  const formatEventDateTime = (date: Date) => {
    const eventDate = new Date(date);
    
    // 格式化日期
    const dateStr = formatDateHelper(eventDate, {
      month: 'short',
      day: 'numeric',
    });
    
    // 格式化時間
    const timeStr = eventDate.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // 使用工具函數判斷相對日期
    let displayDate = dateStr;
    if (isToday(eventDate)) {
      displayDate = '今天';
    } else if (isTomorrow(eventDate)) {
      displayDate = '明天';
    }
    
    return { date: displayDate, time: timeStr };
  };

  // 個案面臨困難分析資料 - 使用主題顏色
  const difficultiesData = [
    { id: 0, value: 145, label: '經濟困難', change: '+8.2%' },
    { id: 1, value: 85, label: '情緒障礙', change: '+7%' },
    { id: 2, value: 40, label: '溝通障礙', change: '+2.5%' },
    { id: 3, value: 12, label: '醫療需求', change: '+4.1%' },
    { id: 4, value: 8, label: '成癮問題', change: '-2.3%' },
    { id: 5, value: 5, label: '家庭暴力', change: '-6.5%' },
    { id: 6, value: 2, label: '犯罪紀錄', change: '+1.7%' }
  ];

  // 困難分析圖表顏色 - 使用主題categorical顏色
  const difficultiesColors = theme.chart.categorical.slice(0, difficultiesData.length);

    return (
    <PageContainer>
      {/* 統一的頁面頭部組件 */}
      <PageHeader
        breadcrumbs={[
          { label: '儀表板', icon: <DashboardIcon sx={{ fontSize: 16 }} /> }
        ]}
        rightContent={
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, md: 2 }
          }}>
            {/* 右上角日期和版本資訊區域 */}
            <Box sx={{ 
              display: { xs: 'none', lg: 'flex' },
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 0.5,
              mr: 1
            }}>
              {/* 今日日期顯示 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5 
              }}>
                <CalendarToday sx={{ 
                  fontSize: 14, 
                  color: theme.customColors.icon 
                }} />
                <Typography sx={{
                  ...theme.customTypography.legendLabel,
                  color: 'text.secondary',
                  fontSize: '0.75rem'
                }}>
                  {formatDate(today)}
                </Typography>
              </Box>
              
              {/* 系統版本顯示 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5 
              }}>
                <Info sx={{ 
                  fontSize: 14, 
                  color: theme.customColors.icon 
                }} />
                <Typography sx={{
                  ...theme.customTypography.legendLabel,
                  color: 'text.secondary',
                  fontSize: '0.75rem'
                }}>
                  系統版本 {systemVersion}
                </Typography>
              </Box>
            </Box>

            {/* 通知鈴鐺按鈕 */}
            <IconButton
              onClick={handleNotificationClick}
              sx={{ 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsNone sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Box>
        }
      />

      {/* 通知選單 */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            width: { xs: 320, sm: 380 }, 
            maxHeight: 500,
            mt: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ 
          p: 2, 
          pb: 1,
          borderRadius: '8px 8px 0 0'
        }}>
          <Typography variant="h6" sx={commonStyles.cardTitle}>
            通知
          </Typography>
        </Box>
        <Divider />
        {notifications.map((notification, index) => (
          <MenuItem 
            key={notification.id} 
            onClick={handleNotificationClose}
            sx={{ 
              py: 1.5,
              px: 2,
              flexDirection: 'column',
              alignItems: 'flex-start',
              borderRadius: 1,
              mx: 1,
              '&:hover': {
                bgcolor: 'action.hover',
                borderRadius: 1
              }
            }}
          >
            <Typography sx={{
              ...theme.customTypography.chartLabel,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}>
              {notification.title}
            </Typography>
            <Typography 
              sx={{
                ...theme.customTypography.legendLabel,
                color: 'text.secondary',
                mt: 0.5,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {notification.time}
            </Typography>
            {index < notifications.length - 1 && <Divider sx={{ width: '100%', mt: 1 }} />}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem 
          onClick={handleNotificationClose}
          sx={{ 
            justifyContent: 'center',
            color: 'primary.main',
            py: 1.5,
            borderRadius: '0 0 8px 8px',
            '&:hover': {
              bgcolor: 'action.hover',
              borderRadius: '0 0 8px 8px'
            }
          }}
        >
          <Typography sx={{
            ...theme.customTypography.chartLabel,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            查看全部通知
          </Typography>
        </MenuItem>
      </Menu>
      
      {/* 統計卡片 */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={{ xs: 2, sm: 3 }}
        sx={{ mb: { xs: 3, md: 4 } }}
      >
        {statsCards.map((card, index) => (
          <Box 
            key={index} 
            sx={{
              flexBasis: { 
                xs: '100%', 
                sm: 'calc(50% - 8px)', 
                md: 'calc(25% - 18px)' 
              },
              minWidth: 0,
              flex: '1 1 auto'
            }}
          >
            <Card sx={{ ...commonStyles.statsCard }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      gutterBottom
                      sx={{ 
                        ...commonStyles.cardLabel,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography 
                      component="div"
                      sx={{ 
                        ...commonStyles.cardValue,
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      color: card.color,
                      fontSize: { xs: 32, sm: 40 }
                    }}
                  >
                    {React.cloneElement(card.icon, { 
                      sx: { fontSize: 'inherit' } 
                    })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* 詳細統計區塊 */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={{ xs: 2, sm: 3 }}
        sx={{ mb: { xs: 3, md: 4 } }}
      >
        {/* 性別分布 - 圓餅圖 */}
        <Box 
          sx={{
            flexBasis: { 
              xs: '100%', 
              sm: 'calc(50% - 8px)', 
              lg: 'calc(33.333% - 16px)' 
            },
            minWidth: 0,
            order: { xs: 1, lg: 1 }
          }}
        >
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                gutterBottom 
                sx={{
                  ...commonStyles.cardTitle,
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                性別分布
              </Typography>
              <Box 
                sx={{ 
                  height: { xs: 200, sm: 250, md: 280, lg: 300 },
                  width: '100%',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  '& .MuiChartsLegend-root': {
                    transform: { xs: 'scale(0.8)', md: 'scale(1)' }
                  }
                }}
              >
                <PieChart
                  series={[
                    {
                      data: genderData,
                    },
                  ]}
                  colors={[theme.chart.categorical[0], theme.chart.categorical[1]]}
                  width={300}
                  height={250}
                  sx={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%'
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>



        {/* 近期活動 */}
        <Box 
          sx={{
            flexBasis: { 
              xs: '100%', 
              sm: 'calc(50% - 8px)', 
              lg: 'calc(33.333% - 16px)' 
            },
            minWidth: 0,
            order: { xs: 2, lg: 2 }
          }}
        >
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                gutterBottom 
                sx={{
                  ...commonStyles.cardTitle,
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                近期活動
              </Typography>
              <Box sx={{ mt: 2, maxHeight: 280, overflowY: 'auto' }}>
                {recentEvents.length > 0 ? (
                  recentEvents.slice(0, 3).map((event, index) => {
                    const { date, time } = formatEventDateTime(event.start);
                    const eventType = eventTypes[event.type as keyof typeof eventTypes];
                    
                    return (
                      <Box key={event.id} sx={{ 
                        mb: 2, 
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                        '&:hover': {
                          bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG,
                          borderColor: THEME_COLORS.PRIMARY
                        },
                        transition: 'all 0.2s ease'
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          mb: 1
                        }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ 
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              color: THEME_COLORS.TEXT_PRIMARY,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {event.title}
                            </Typography>
                            <Typography sx={{ 
                              fontSize: '0.75rem',
                              color: THEME_COLORS.TEXT_MUTED,
                              mt: 0.5
                            }}>
                              {date} {time}
                            </Typography>
                          </Box>
                          <Chip
                            label={eventType.label}
                            size="small"
                            sx={{
                              backgroundColor: eventType.color,
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 20,
                              ml: 1
                            }}
                          />
                        </Box>
                        {event.description && (
                          <Typography sx={{ 
                            fontSize: '0.75rem',
                            color: THEME_COLORS.TEXT_SECONDARY,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {event.description}
                          </Typography>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 3,
                    color: THEME_COLORS.TEXT_MUTED
                  }}>
                    <CalendarToday sx={{ 
                      fontSize: 32, 
                      mb: 1, 
                      opacity: 0.5 
                    }} />
                    <Typography sx={{ 
                      fontSize: '0.875rem'
                    }}>
                      近期無安排活動
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* 居住地區分布 - 長條圖 */}
        <Box 
          sx={{
            flexBasis: { 
              xs: '100%', 
              lg: 'calc(33.333% - 16px)' 
            },
            minWidth: 0,
            order: { xs: 3, lg: 3 }
          }}
        >
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                gutterBottom 
                sx={{
                  ...commonStyles.cardTitle,
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                全台個案地區分布
              </Typography>
              <Box 
                sx={{ 
                  height: { xs: 250, sm: 300, md: 350, lg: 300 },
                  width: '100%',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  overflow: 'hidden'
                }}
              >
                <BarChart
                    dataset={regionDistributionData}
                    xAxis={[{ 
                      scaleType: 'band', 
                      dataKey: 'region'
                    }]}
                    series={[
                      {
                        dataKey: 'count',
                        label: '個案人數',
                        color: theme.chart.geographic[0]
                      },
                    ]}
                    colors={theme.chart.geographic}
                    width={500}
                    height={300}
                    sx={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%',
                      '& .MuiChartsAxis-tickLabel': {
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                      },
                      '& .MuiChartsAxis-tick': {
                        stroke: 'rgba(0,0,0,0.2)'
                      },
                      '& .MuiChartsAxis-line': {
                        stroke: 'rgba(0,0,0,0.2)'
                      }
                    }}
                    margin={{ 
                      left: 40, 
                      right: 20, 
                      top: 20, 
                      bottom: 60
                    }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 個案面臨困難分析 */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={{ xs: 2, sm: 3 }}
        sx={{ mb: { xs: 3, md: 4 } }}
        alignItems="stretch"
      >
        <Box 
          sx={{
            flexBasis: { xs: '100%' },
            minWidth: 0,
            display: 'flex'
          }}
        >
          <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
              <Typography 
                gutterBottom 
                sx={{
                  ...commonStyles.cardTitle,
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                個案面臨困難分析
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'center', md: 'center' }, 
                gap: { xs: 2, md: 3 }
              }}>
                {/* 甜甜圈圖 */}
                <Box 
                  sx={{ 
                    flex: '0 0 auto',
                    width: { xs: 180, sm: 200, md: 200, lg: 220 },
                    height: { xs: 180, sm: 200, md: 200, lg: 220 },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <PieChart
                    series={[
                      {
                        data: difficultiesData.map(item => ({ 
                          id: item.id, 
                          value: item.value
                        })),
                        innerRadius: 35,
                        outerRadius: 75,
                        paddingAngle: 2,
                        arcLabel: () => '', // 移除弧形標籤
                      },
                    ]}
                    colors={difficultiesColors}
                    width={220}
                    height={220}
                    sx={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%'
                    }}
                    margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  />
                </Box>
                
                {/* 圖例 */}
                <Box sx={{ 
                  flex: 1, 
                  pl: { xs: 0, md: 2 },
                  width: { xs: '100%', md: 'auto' }
                }}>
                  {difficultiesData.map((difficulty, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: { xs: 1.5, sm: 2 },
                      py: 0,
                      gap: 1
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 1, sm: 2 }, 
                        flex: 1, 
                        minWidth: 0 
                      }}>
                        <Box 
                          sx={{ 
                            width: { xs: 20, sm: 24 }, 
                            height: { xs: 12, sm: 16 }, 
                            borderRadius: 1, 
                            bgcolor: difficultiesColors[index],
                            flexShrink: 0
                          }} 
                        />
                        <Typography sx={{ 
                          ...theme.customTypography.legendLabel,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}>
                          {difficulty.label}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 0.5, sm: 1 }, 
                        flexShrink: 0 
                      }}>
                        <Typography sx={{ 
                          ...theme.customTypography.chartLabel, 
                          minWidth: { xs: '35px', sm: '40px' }, 
                          textAlign: 'right',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}>
                          {difficulty.value}人
                        </Typography>
                        <Box 
                          sx={{ 
                            bgcolor: difficulty.change.startsWith('+') 
                              ? theme.customColors.changePositive 
                              : theme.customColors.changeNegative,
                            color: 'white',
                            px: { xs: 1, sm: 1.5 },
                            py: { xs: 0.3, sm: 0.5 },
                            borderRadius: 2,
                            minWidth: { xs: '50px', sm: '60px' },
                            textAlign: 'center',
                            ...theme.customTypography.changeIndicator,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          {difficulty.change}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

    </PageContainer>
  );
};

export default Dashboard;
