import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card,
  CardContent, 
  Typography, 
  useTheme,
  Chip,
  Skeleton
} from '@mui/material';
import { PieChart, BarChart } from '@mui/x-charts';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import { CalendarEvent, scheduleService } from '../services/scheduleService';
import { calendarService, caseService, activityService, authService } from '../services';
import { dashboardService, DashboardStats, GenderDistribution, CaseDistribution, DifficultyAnalysis } from '../services/dashboardService';
import { 
  People, 
  Assignment, 
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
 * 3. 顯示系統資訊（日期、版本）
 * 
 * 這是用戶登入後看到的主要頁面，提供整個案件管理系統的概覽視圖
 */
const Dashboard: React.FC = () => {
  const theme = useTheme();
  

  
  // 最近行事曆活動狀態
  const [recentEvents, setRecentEvents] = useState<CalendarEvent[]>([]);
  
  // 圖表數據狀態
  const [genderData, setGenderData] = useState<{id: number, value: number, label: string}[]>([]);
  const [regionDistributionData, setRegionDistributionData] = useState<{region: string, count: number}[]>([]);
  const [difficultyData, setDifficultyData] = useState<{difficulty: string, count: number}[]>([]);
  


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

  // 統計卡片資料 - 使用載入動畫取代初始的 0
  const [statsCards, setStatsCards] = useState([
    {
      title: '個案人數',
      value: '載入中...',
      icon: <Assignment />,
      color: THEME_COLORS.PINK_500,
      loading: true
    },
    {
      title: '志工人數',
      value: '載入中...',
      icon: <People />,
      color: THEME_COLORS.BLUE_500,
      loading: true
    },
    {
      title: '活動總數',
      value: '載入中...',
      icon: <CalendarToday />,
      color: THEME_COLORS.TEAL_500,
      loading: true
    },
    {
      title: '本月完成活動',
      value: '載入中...',
      icon: <TrendingUp />,
      color: THEME_COLORS.PURPLE_500,
      loading: true
    }
  ]);



  // 事件類型配置 - 使用色票系統
  const eventTypes = {
    meeting: { label: '會議', color: THEME_COLORS.PURPLE_500 },
    activity: { label: '活動', color: THEME_COLORS.PINK_500 },
    'case-visit': { label: '個案訪問', color: THEME_COLORS.BLUE_500 },
    training: { label: '培訓', color: THEME_COLORS.TEAL_500 },
    other: { label: '其他', color: THEME_COLORS.LIGHT_GREEN_500 },
  };

  /**
   * 載入最近的行事曆活動
   */
  const loadRecentEvents = async () => {
    try {
      // 從登入狀態獲取當前工作人員資訊
      const currentWorker = authService.getCurrentWorker();
      if (!currentWorker) {
        console.warn('未找到登入工作人員資訊');
        return;
      }
      
      const workerId = currentWorker.workerId;
      const userRole = currentWorker.role;
      
      console.log(`載入行事曆活動 - 用戶: ${currentWorker.name}, 角色: ${userRole}, WorkerId: ${workerId}`);
      
      // Dashboard 顯示個人近期活動（包括主管）
      const schedules = await scheduleService.getSchedulesByWorker(workerId);
      const allEvents = schedules.map(schedule => scheduleService.convertToCalendarEvent(schedule));
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
      // 如果載入失敗（例如 404），設置空陣列避免一直重試
      setRecentEvents([]);
    }
  };

  // 載入統計資料
  const loadStatistics = async () => {
    try {
      // 獲取當前用戶資訊
      const currentWorker = authService.getCurrentWorker();
      if (!currentWorker) {
        console.warn('未找到登入工作人員資訊');
        return;
      }
      
      const workerId = currentWorker.workerId;
      const userRole = currentWorker.role;
      
      console.log(`載入統計資料 - 用戶: ${currentWorker.name}, 角色: ${userRole}`);
      
      // 根據角色決定載入範圍
      let stats;
      if (userRole === 'supervisor' || userRole === 'admin') {
        // 主管和管理員看全系統統計
        console.log('主管權限：載入全系統統計');
        stats = await dashboardService.getStats();
      } else {
        // 員工只看自己的統計 - 暫時使用全系統統計，等後端API完成後修改
        console.log(`員工權限：只載入自己的統計 (WorkerId: ${workerId})`);
        stats = await dashboardService.getStats(); // TODO: 改為 getStatsForWorker(workerId)
      }
      
      // 更新統計卡片
      setStatsCards([
        {
          title: '個案人數',
          value: stats.totalCases.toString(),
          icon: <Assignment />,
          color: THEME_COLORS.PINK_500,
          loading: false
        },
        {
          title: '用戶人數',
          value: stats.totalUsers.toString(),
          icon: <People />,
          color: THEME_COLORS.BLUE_500,
          loading: false
        },
        {
          title: '活動總數',
          value: stats.totalActivities.toString(),
          icon: <CalendarToday />,
          color: THEME_COLORS.TEAL_500,
          loading: false
        },
        {
          title: '本月完成活動',
          value: stats.monthlyCompletedActivities.toString(),
          icon: <TrendingUp />,
          color: THEME_COLORS.PURPLE_500,
          loading: false
        }
      ]);
    } catch (error) {
      console.error('載入統計資料失敗:', error);
    }
  };

  // 載入圖表數據
  const loadChartData = async () => {
    try {
      // 載入性別分佈數據
      const genderDistribution = await dashboardService.getGenderDistribution();
      const genderChartData = genderDistribution.map((item, index) => ({
        id: index,
        value: item.count,
        label: item.gender === 'Male' ? '男生' : item.gender === 'Female' ? '女生' : item.gender
      }));
      setGenderData(genderChartData);

      // 載入個案城市分佈數據
      const caseDistribution = await dashboardService.getCaseDistribution();
      const regionChartData = caseDistribution.map(item => ({
        region: item.city,
        count: item.count
      }));
      setRegionDistributionData(regionChartData);

      // 載入困難類型分析數據
      const difficultyAnalysis = await dashboardService.getDifficultyAnalysis();
      const difficultyChartData = difficultyAnalysis.map(item => ({
        difficulty: item.difficultyType,
        count: item.count
      }));
      setDifficultyData(difficultyChartData);

    } catch (error) {
      console.error('載入圖表數據失敗:', error);
    }
  };

  // 組件載入時載入資料
  useEffect(() => {
    loadRecentEvents();
    loadStatistics();
    loadChartData();
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

  // 將困難數據轉換為圖表格式
  const difficultiesData = difficultyData.map((item, index) => ({
    id: index,
    value: item.count,
    label: item.difficulty,
    change: '+0%' // 暫時使用固定值，後續可以加入變化計算
  }));

  // 困難分析圖表顏色 - 使用色票系統
  const getDifficultyColor = (difficulty: string) => {
    const colorMap: { [key: string]: string } = {
      '經濟困難': THEME_COLORS.PINK_500,     // 粉色系 - 緊急
      '家庭問題': THEME_COLORS.BROWN_500,    // 棕色系 - 家庭
      '學習困難': THEME_COLORS.BLUE_500,     // 藍色系 - 學習
      '健康問題': THEME_COLORS.PINK_700,     // 深粉色 - 健康
      '行為問題': THEME_COLORS.PURPLE_500,   // 紫色系 - 行為
      '人際關係': THEME_COLORS.TEAL_500,     // 青色系 - 社交
      '情緒困擾': THEME_COLORS.DEEP_PURPLE_500, // 深紫色 - 情緒
      '其他困難': THEME_COLORS.LIGHT_GREEN_500  // 黃綠色 - 其他
    };
    return colorMap[difficulty] || THEME_COLORS.PRIMARY;
  };

  // 根據困難類型動態生成顏色
  const difficultiesColors = difficultiesData.map(item => 
    getDifficultyColor(item.label)
  );

  // 地區分布使用色票系統 - 完整光譜
  const regionColors = theme.chart.geographic;

    return (
    <PageContainer>
      {/* 統一的頁面頭部組件 */}
      <PageHeader
        breadcrumbs={[
          { label: '儀表板', icon: <DashboardIcon sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }} /> }
        ]}
        rightContent={
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 1.5, md: 2 },
            px: { xs: 1, sm: 0 }
          }}>
            {/* 右上角日期和版本資訊區域 */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: { xs: 0.5, sm: 0.75, md: 1 },
              mr: { xs: 1, sm: 1.5 }
            }}>
              {/* 今日日期顯示 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.5, md: 0.75 } // 平板增加間距
              }}>
                <CalendarToday sx={{ 
                  fontSize: { xs: 12, sm: 14, md: 18 }, // 平板增加圖標大小
                  color: theme.customColors.icon 
                }} />
                <Typography sx={{
                  ...theme.customTypography.legendLabel,
                  color: 'text.secondary',
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem' } // 平板增加字體大小
                }}>
                  {formatDate(today)}
                </Typography>
              </Box>
              
              {/* 系統版本顯示 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.5, md: 0.75 } // 平板增加間距
              }}>
                <Info sx={{ 
                  fontSize: { xs: 12, sm: 14, md: 18 }, // 平板增加圖標大小
                  color: theme.customColors.icon 
                }} />
                <Typography sx={{
                  ...theme.customTypography.legendLabel,
                  color: 'text.secondary',
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem' } // 平板增加字體大小
                }}>
                  系統版本 {systemVersion}
                </Typography>
              </Box>
            </Box>


          </Box>
        }
      />


      
      {/* 統計卡片 */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={{ xs: 2, sm: 2, md: 3 }}
        sx={{ 
          mb: { xs: 3, md: 4 },
          px: { xs: 1, sm: 0 }
        }}
      >
        {statsCards.map((card, index) => (
          <Box 
            key={index} 
            sx={{
              flexBasis: { 
                xs: '100%', 
                sm: 'calc(50% - 8px)', 
                md: 'calc(33.333% - 12px)', // 平板橫屏：3列佈局
                lg: 'calc(25% - 18px)' 
              },
              minWidth: 0,
              flex: '1 1 auto',
              display: 'flex'
            }}
          >
            <Card sx={{ 
              ...commonStyles.statsCard,
              height: { xs: 140, sm: 150, md: 170, lg: 160 }, // 平板增加高度
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: { xs: 1, sm: 2 }
            }}>
              <CardContent sx={{ 
                p: { xs: 2, sm: 2.5, md: 3 },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ height: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      sx={{ 
                        ...theme.customTypography.chartLabel,
                        color: theme.customTypography.cardLabel.color,
                        fontSize: { xs: '1rem', sm: '1.125rem', md: '1.1rem' }, // 平板略微調整
                        fontWeight: 500,
                        mb: { xs: 0.5, sm: 1, md: 1.2 }, // 平板增加間距
                        letterSpacing: '0.01em'
                      }}
                    >
                      {card.title}
                    </Typography>
                    {card.loading ? (
                      <Skeleton 
                        variant="text" 
                        width="80%" 
                        height={50}
                        sx={{
                          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.1rem', lg: '2.25rem' },
                          transform: 'none'
                        }}
                      />
                    ) : (
                      <Typography 
                        component="div"
                        sx={{ 
                          ...theme.customTypography.cardValue,
                          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.1rem', lg: '2.25rem' }, // 平板優化
                          fontWeight: 700,
                          lineHeight: 1.1,
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {card.value}
                      </Typography>
                    )}
                  </Box>
                  <Box 
                    sx={{ 
                      color: card.color,
                      fontSize: { xs: 36, sm: 40, md: 42, lg: 44 }, // 平板優化
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      width: { xs: 48, sm: 52, md: 54, lg: 56 }, // 平板優化
                      height: { xs: 48, sm: 52, md: 54, lg: 56 } // 平板優化
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
        gap={{ xs: 2, sm: 2, md: 3 }}
        sx={{ 
          mb: { xs: 3, md: 4 },
          px: { xs: 1, sm: 0 }
        }}
      >
        {/* 性別分布 - 圓餅圖 */}
        <Box 
          sx={{
            flexBasis: { 
              xs: '100%', 
              sm: '100%', 
              md: 'calc(50% - 12px)',
              lg: 'calc(33.333% - 16px)' 
            },
            minWidth: 0,
            order: { xs: 1, md: 1, lg: 1 }
          }}
        >
          <Card sx={{ boxShadow: { xs: 1, sm: 2 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
              <Typography 
                gutterBottom 
                sx={{
                  ...commonStyles.cardTitle,
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.125rem' }
                }}
              >
                性別分布
              </Typography>
              <Box 
                sx={{ 
                  height: { xs: 250, sm: 280, md: 320, lg: 320 }, // 平板增加高度
                  width: '100%',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  '& .MuiChartsLegend-root': {
                    transform: { xs: 'scale(0.8)', sm: 'scale(0.85)', md: 'scale(0.95)', lg: 'scale(1)' }
                  }
                }}
              >
                <PieChart
                  series={[
                    {
                      data: genderData,
                    },
                  ]}
                  colors={[THEME_COLORS.BLUE_200, THEME_COLORS.PINK_200]} // 使用色票中的藍色和粉色
                  width={320}
                  height={270}
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
              sm: '100%', 
              md: 'calc(50% - 12px)',
              lg: 'calc(33.333% - 16px)' 
            },
            minWidth: 0,
            order: { xs: 2, md: 2, lg: 2 }
          }}
        >
          <Card sx={{ boxShadow: { xs: 1, sm: 2 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
              <Typography 
                gutterBottom 
                sx={{
                  ...commonStyles.cardTitle,
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.125rem' }
                }}
              >
                近期活動
              </Typography>
              <Box sx={{ mt: 2, maxHeight: { xs: 300, sm: 320, md: 320, lg: 300 }, overflowY: 'auto' }}>
                {recentEvents.length > 0 ? (
                  recentEvents.slice(0, 3).map((event, index) => {
                    const { date, time } = formatEventDateTime(event.start);
                    const eventType = eventTypes[event.type as keyof typeof eventTypes];
                    
                    return (
                      <Box key={event.id} sx={{ 
                        mb: { xs: 1.5, sm: 2, md: 2.5 }, 
                        p: { xs: 1.5, sm: 2, md: 2.5 }, // 平板增加內邊距
                        borderRadius: 2,
                        bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                        '&:hover': {
                          bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG,
                          borderColor: THEME_COLORS.PRIMARY
                        },
                        transition: 'all 0.2s ease',
                        minHeight: { md: '80px' }, // 平板增加最小高度提升觸摸友好性
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          mb: { xs: 0.5, sm: 1 }
                        }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ 
                              fontWeight: 600,
                              fontSize: { xs: '0.875rem', sm: '0.9rem' },
                              color: THEME_COLORS.TEXT_PRIMARY,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {event.title}
                            </Typography>
                            <Typography sx={{ 
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
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
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 22 },
                              ml: 1
                            }}
                          />
                        </Box>
                        {event.description && (
                          <Typography sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
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
                      fontSize: { xs: 28, sm: 32, md: 36 }, 
                      mb: 1, 
                      opacity: 0.5 
                    }} />
                    <Typography sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' }
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
              sm: '100%',
              md: '100%',
              lg: 'calc(33.333% - 16px)' 
            },
            minWidth: 0,
            order: { xs: 3, sm: 3, md: 3, lg: 3 }
          }}
        >
          <Card sx={{ boxShadow: { xs: 1, sm: 2 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
              <Typography 
                gutterBottom 
                sx={{
                  ...commonStyles.cardTitle,
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.125rem' }
                }}
              >
                全台個案地區分布
              </Typography>
              <Box 
                sx={{ 
                  height: { xs: 300, sm: 350, md: 420, lg: 350 }, // 平板增加高度
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
                        color: regionColors[0] // 使用新的色票
                      },
                    ]}
                    colors={regionColors} // 使用色票系統的藍色系
                    width={550}
                    height={340} // 平板增加圖表高度
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
        gap={{ xs: 2, sm: 2, md: 3 }}
        sx={{ 
          mb: { xs: 3, md: 4 },
          px: { xs: 1, sm: 0 }
        }}
        alignItems="stretch"
      >
        <Box 
          sx={{
            flexBasis: { xs: '100%' },
            minWidth: 0,
            display: 'flex'
          }}
        >
          <Card sx={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: { xs: 1, sm: 2 }
          }}>
            <CardContent sx={{ flex: 1, p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
              <Typography 
                gutterBottom 
                sx={{
                  ...commonStyles.cardTitle,
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.125rem' }
                }}
              >
                個案面臨困難分析
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                alignItems: { xs: 'center', sm: 'center', md: 'center' }, 
                gap: { xs: 2, sm: 2.5, md: 3.5 } // 平板增加間距
              }}>
                {/* 甜甜圈圖 */}
                <Box 
                  sx={{ 
                    flex: '0 0 auto',
                    width: { xs: 200, sm: 220, md: 220, lg: 240 },
                    height: { xs: 200, sm: 220, md: 220, lg: 240 },
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
                    width={260}
                    height={260}
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
                  pl: { xs: 0, sm: 0, md: 2 },
                  width: { xs: '100%', sm: '100%', md: 'auto' }
                }}>
                  {difficultiesData.map((difficulty, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: { xs: 1.5, sm: 2, md: 2.5 },
                      py: { xs: 0.5, sm: 1, md: 1.5 }, // 平板增加垂直內邊距
                      gap: { xs: 1, sm: 1.5, md: 2 }, // 平板增加間距
                      minHeight: { md: '44px' }, // 平板增加最小高度提升觸摸友好性
                      borderRadius: 1,
                      px: { md: 1 }, // 平板增加水平內邊距
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      transition: 'background-color 0.2s ease'
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
                            width: { xs: 20, sm: 24, md: 28 }, 
                            height: { xs: 12, sm: 16, md: 18 }, 
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
                          minWidth: { xs: '35px', sm: '40px', md: '45px' }, 
                          textAlign: 'right',
                          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.9rem' }
                        }}>
                          {difficulty.value}人
                        </Typography>
                        <Box 
                          sx={{ 
                            bgcolor: difficulty.change.startsWith('+') 
                              ? theme.customColors.changePositive 
                              : theme.customColors.changeNegative,
                            color: 'white',
                            px: { xs: 1, sm: 1.5, md: 2 },
                            py: { xs: 0.3, sm: 0.5, md: 0.6 },
                            borderRadius: 2,
                            minWidth: { xs: '50px', sm: '60px', md: '65px' },
                            textAlign: 'center',
                            ...theme.customTypography.changeIndicator,
                            fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.8rem' }
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
