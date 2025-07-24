import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card,
  CardContent, 
  Typography, 
  useTheme,
  Chip,
  CircularProgress
} from '@mui/material';
import { PieChart, BarChart } from '@mui/x-charts';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import { CalendarEvent, scheduleService } from '../services/scheduleService';
import { calendarService, caseService, activityService, authService } from '../services';
import { dashboardService, DashboardStats, GenderDistribution, CaseDistribution, CountyDistribution, DifficultyAnalysis } from '../services/dashboardService';
import { 
  People, 
  Assignment, 
  CalendarToday,
  Info,
  Dashboard as DashboardIcon,
  TrendingUp,
  Map as MapIcon
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
  const [countyDistributionData, setCountyDistributionData] = useState<{county: string, count: number}[]>([]);
  


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
      value: '',
      subtitle: '',
      icon: <Assignment />,
      color: THEME_COLORS.CHART_COLOR_1, // 主綠色
      loading: true
    },
    {
      title: '志工人數',
      value: '',
      subtitle: '',
      icon: <People />,
      color: THEME_COLORS.CHART_COLOR_2, // 藍色
      loading: true
    },
    {
      title: '活動總數',
      value: '',
      subtitle: '',
      icon: <CalendarToday />,
      color: THEME_COLORS.CHART_COLOR_5, // 青色
      loading: true
    },
    {
      title: '本月完成活動',
      value: '',
      subtitle: '',
      icon: <TrendingUp />,
      color: THEME_COLORS.CHART_COLOR_4, // 紫色
      loading: true
    }
  ]);



  // 事件類型配置 - 使用簡化色票系統
  const eventTypes = {
    meeting: { label: '會議', color: THEME_COLORS.CHART_COLOR_4 }, // 紫色
    activity: { label: '活動', color: THEME_COLORS.CHART_COLOR_3 }, // 橙色
    'case-visit': { label: '個案訪問', color: THEME_COLORS.CHART_COLOR_2 }, // 藍色
    training: { label: '培訓', color: THEME_COLORS.CHART_COLOR_5 }, // 青色
    other: { label: '其他', color: THEME_COLORS.CHART_COLOR_1 }, // 主綠色
    schedule: { label: '行程', color: '#FFFFFF' }, // 白色
  };

  /**
   * 將活動轉換為日曆事件
   */
  const convertActivityToCalendarEvent = (activity: any): CalendarEvent & { eventSource: 'activity' } => {
    return {
      id: `activity_${activity.activityId}`,
      title: activity.activityName,
      start: new Date(activity.startDate),
      end: new Date(activity.endDate),
      type: 'activity',
      description: activity.description,
      workerId: activity.workerId,
      status: activity.status,
      eventSource: 'activity'
    } as CalendarEvent & { eventSource: 'activity' };
  };

  /**
   * 載入最近的行事曆活動（包含活動和行程）
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
      
      console.log(`載入近期活動和行程 - 用戶: ${currentWorker.name}, 角色: ${userRole}, WorkerId: ${workerId}`);
      
      const allEvents: (CalendarEvent & { eventSource?: 'activity' | 'schedule' })[] = [];
      const now = new Date();
      
      // 載入行程資料
      try {
        const schedules = await scheduleService.getSchedulesByWorker(workerId);
        const scheduleEvents = schedules
          .map(schedule => {
            const event = scheduleService.convertToCalendarEvent(schedule);
            return { ...event, eventSource: 'schedule' as const };
          })
          .filter(event => {
            const eventDate = new Date(event.start);
            const diffTime = eventDate.getTime() - now.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            return diffDays >= 0 && diffDays <= 14; // 未來14天內
          });
        allEvents.push(...scheduleEvents);
        console.log(`載入了 ${scheduleEvents.length} 筆行程資料`);
      } catch (scheduleError) {
        console.error('載入行程失敗:', scheduleError);
      }
      
      // 載入活動資料
      try {
        const activityResponse = await activityService.getActivities();
        const activities = activityResponse.activities || [];
        
        // 所有人（包含主管）都只看自己相關的活動，避免互相干擾
        const userActivities = activities.filter(activity => activity.workerId === workerId);
        
        const activityEvents = userActivities
          .map(convertActivityToCalendarEvent)
          .filter(event => {
            const eventDate = new Date(event.start);
            const diffTime = eventDate.getTime() - now.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            return diffDays >= 0 && diffDays <= 14; // 未來14天內
          });
        allEvents.push(...activityEvents);
        console.log(`載入了 ${activityEvents.length} 筆活動資料`);
      } catch (activityError) {
        console.error('載入活動失敗:', activityError);
      }
      
      // 複雜排序：3天內行程 > 3天內活動 > 其他行程 > 其他活動
      const upcomingEvents = allEvents
        .sort((a, b) => {
          const aEventWithSource = a as CalendarEvent & { eventSource?: 'activity' | 'schedule' };
          const bEventWithSource = b as CalendarEvent & { eventSource?: 'activity' | 'schedule' };
          
          const aDate = new Date(a.start);
          const bDate = new Date(b.start);
          const aDaysFromNow = (aDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
          const bDaysFromNow = (bDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
          
          const aIsWithin3Days = aDaysFromNow <= 3;
          const bIsWithin3Days = bDaysFromNow <= 3;
          const aIsSchedule = aEventWithSource.eventSource === 'schedule';
          const bIsSchedule = bEventWithSource.eventSource === 'schedule';
          
          // 定義優先級：數字越小優先級越高
          const getPriority = (isWithin3Days: boolean, isSchedule: boolean) => {
            if (isWithin3Days && isSchedule) return 1; // 3天內行程
            if (isWithin3Days && !isSchedule) return 2; // 3天內活動
            if (!isWithin3Days && isSchedule) return 3; // 其他行程
            return 4; // 其他活動
          };
          
          const aPriority = getPriority(aIsWithin3Days, aIsSchedule);
          const bPriority = getPriority(bIsWithin3Days, bIsSchedule);
          
          // 先按優先級排序
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // 同優先級內按時間排序
          return aDate.getTime() - bDate.getTime();
        })
        .slice(0, 8);
      
      setRecentEvents(upcomingEvents);
      
      if (upcomingEvents.length === 0) {
        console.log('未來兩周內沒有活動或行程');
      } else {
        const scheduleCount = upcomingEvents.filter(e => e.eventSource === 'schedule').length;
        const activityCount = upcomingEvents.filter(e => e.eventSource === 'activity').length;
        console.log(`載入了 ${scheduleCount} 筆行程和 ${activityCount} 筆活動`);
      }
    } catch (error) {
      console.error('載入近期事件失敗:', error);
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
      
      // 所有人都只看自己相關的統計資料，避免互相干擾
      console.log(`載入個人相關統計 - 用戶: ${currentWorker.name}, 角色: ${userRole}, WorkerId: ${workerId}`);
      
      // 暫時使用全系統統計，等後端個人統計API完成後修改
      // TODO: 改為 getStatsForWorker(workerId) 來獲取個人相關統計
      const stats = await dashboardService.getStats();
      
      // 更新統計卡片
      setStatsCards([
        {
          title: '個案人數',
          value: stats.totalCases.toString(),
          subtitle: `今年新增: ${stats.thisYearNewCases} (${stats.casesGrowthPercentage >= 0 ? '+' : ''}${stats.casesGrowthPercentage}%)`,
          icon: <Assignment />,
          color: THEME_COLORS.CHART_COLOR_1, // 主綠色
          loading: false
        },
        {
          title: '志工人數',
          value: stats.totalWorkers.toString(),
          subtitle: `今年新增: ${stats.thisYearNewWorkers} (${stats.workersGrowthPercentage >= 0 ? '+' : ''}${stats.workersGrowthPercentage}%)`,
          icon: <People />,
          color: THEME_COLORS.CHART_COLOR_2, // 藍色
          loading: false
        },
        {
          title: '活動總數',
          value: stats.totalActivities.toString(),
          subtitle: '',
          icon: <CalendarToday />,
          color: THEME_COLORS.CHART_COLOR_5, // 青色
          loading: false
        },
        {
          title: '本月完成活動',
          value: stats.monthlyCompletedActivities.toString(),
          subtitle: '',
          icon: <TrendingUp />,
          color: THEME_COLORS.CHART_COLOR_4, // 紫色
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

      // 載入縣市分佈數據 (用於地圖顯示)
      try {
        const countyDistribution = await dashboardService.getCountyDistribution();
        const countyMapData = countyDistribution.map(item => ({
          county: item.county,
          count: item.count
        }));
        setCountyDistributionData(countyMapData);
      } catch (countyError) {
        console.warn('縣市分佈API尚未實作，使用城市資料模擬:', countyError);
        // 如果縣市API還沒實作，使用現有的城市資料作為模擬
        const simulatedCountyData = caseDistribution.map(item => ({
          county: item.city.replace('市', '').replace('縣', '') + (item.city.includes('市') ? '市' : '縣'),
          count: item.count
        }));
        setCountyDistributionData(simulatedCountyData);
      }

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

  // 困難分析圖表顏色 - 使用簡化色票系統
  const getDifficultyColor = (difficulty: string) => {
    const colorMap: { [key: string]: string } = {
      '經濟困難': THEME_COLORS.CHART_COLOR_6,  // 紅色 - 緊急
      '家庭問題': THEME_COLORS.CHART_COLOR_3,  // 橙色 - 家庭
      '學習困難': THEME_COLORS.CHART_COLOR_2,  // 藍色 - 學習
      '健康問題': THEME_COLORS.CHART_COLOR_4,  // 紫色 - 健康
      '行為問題': THEME_COLORS.CHART_COLOR_5,  // 青色 - 行為
      '人際關係': THEME_COLORS.CHART_COLOR_1,  // 主綠色 - 社交
      '情緒困擾': THEME_COLORS.CHART_COLOR_4,  // 紫色 - 情緒
      '其他困難': THEME_COLORS.CHART_COLOR_1   // 主綠色 - 其他
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
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        py: 2
                      }}>
                        <CircularProgress 
                          size={32}
                          thickness={4}
                          sx={{ color: card.color }}
                        />
                      </Box>
                    ) : (
                      <>
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
                        {card.subtitle && (
                          <Typography 
                            sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                              color: 'text.secondary',
                              mt: 0.5,
                              fontWeight: 500
                            }}
                          >
                            {card.subtitle}
                          </Typography>
                        )}
                      </>
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
                  colors={[THEME_COLORS.MALE_AVATAR, THEME_COLORS.FEMALE_AVATAR]} // 使用性別專用顏色：男生淡藍色、女生淡紅色
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
                  recentEvents.map((event, index) => {
                    const { date, time } = formatEventDateTime(event.start);
                    const eventWithSource = event as CalendarEvent & { eventSource?: 'activity' | 'schedule' };
                    
                    // 根據事件來源決定顏色和標籤
                    let chipColor, chipLabel, chipTextColor;
                    if (eventWithSource.eventSource === 'activity') {
                      chipColor = '#FF9800'; // 橘色
                      chipLabel = '活動';
                      chipTextColor = 'white';
                    } else if (eventWithSource.eventSource === 'schedule') {
                      chipColor = '#FFFFFF'; // 白色
                      chipLabel = '行程';
                      chipTextColor = '#333333';
                    } else {
                      // 後備方案：使用原有的 eventType
                      const eventType = eventTypes[event.type as keyof typeof eventTypes];
                      chipColor = eventType?.color || THEME_COLORS.PRIMARY;
                      chipLabel = eventType?.label || '其他';
                      chipTextColor = 'white';
                    }
                    
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
                            label={chipLabel}
                            size="small"
                            sx={{
                              backgroundColor: chipColor,
                              color: chipTextColor,
                              border: chipColor === '#FFFFFF' ? '2px solid #E0E0E0' : 'none',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 22 },
                              ml: 1,
                              fontWeight: 500
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

      </Box>

      {/* 地區分布圓餅圖 */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={{ xs: 2, sm: 2, md: 3 }}
        sx={{ 
          mb: { xs: 3, md: 4 },
          px: { xs: 1, sm: 0 }
        }}
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
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 2 
              }}>
                <MapIcon sx={{ 
                  color: THEME_COLORS.PRIMARY,
                  fontSize: { xs: 20, sm: 22, md: 24 }
                }} />
                <Typography 
                  sx={{
                    ...commonStyles.cardTitle,
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.125rem' }
                  }}
                >
                  全台個案地區分佈
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                {/* 圓餅圖 */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <PieChart
                    series={[
                      {
                        data: countyDistributionData.map((item, index) => ({
                          id: index,
                          value: item.count,
                          label: item.county
                        })),
                        innerRadius: 60,
                        outerRadius: 120,
                        paddingAngle: 2,
                        arcLabel: () => '', // 移除弧形標籤
                      },
                    ]}
                    colors={[
                      THEME_COLORS.CHART_COLOR_1, THEME_COLORS.CHART_COLOR_2, 
                      THEME_COLORS.CHART_COLOR_3, THEME_COLORS.CHART_COLOR_4,
                      THEME_COLORS.CHART_COLOR_5, THEME_COLORS.CHART_COLOR_6,
                      '#8E44AD', '#E67E22', '#F39C12', '#27AE60',
                      '#3498DB', '#E74C3C', '#9B59B6', '#1ABC9C'
                    ]}
                    width={400}
                    height={300}
                    slotProps={{
                      legend: { hidden: true } // 隱藏內建圖例
                    }}
                    sx={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%'
                    }}
                  />
                </Box>

                {/* 自訂圖例 - 只顯示左邊的縣市 */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1,
                  maxWidth: '50%',
                  width: '50%',
                  px: 2
                }}>
                  {countyDistributionData.slice(0, Math.ceil(countyDistributionData.length / 2)).map((item, index) => {
                    const colors = [
                      THEME_COLORS.CHART_COLOR_1, THEME_COLORS.CHART_COLOR_2, 
                      THEME_COLORS.CHART_COLOR_3, THEME_COLORS.CHART_COLOR_4,
                      THEME_COLORS.CHART_COLOR_5, THEME_COLORS.CHART_COLOR_6,
                      '#8E44AD', '#E67E22', '#F39C12', '#27AE60',
                      '#3498DB', '#E74C3C', '#9B59B6', '#1ABC9C'
                    ];
                    return (
                      <Box 
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          minWidth: 0
                        }}
                      >
                        <Box 
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: colors[index % colors.length],
                            flexShrink: 0
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{
                            fontSize: '0.75rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.county} ({item.count})
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
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
