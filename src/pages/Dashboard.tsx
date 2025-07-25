import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card,
  CardContent, 
  Typography, 
  useTheme,
  Chip
} from '@mui/material';
import { PieChart, BarChart } from '@mui/x-charts';
import PageHeader from '../components/shared/PageHeader';
import PageContainer from '../components/shared/PageContainer';
import StatCard from '../components/shared/StatCard';
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
import RegionChart from '../components/shared/RegionChart';
import GenderChart from '../components/shared/GenderChart';
import DifficultyRadarChart from '../components/shared/DifficultyRadarChart';

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
  const [countyDistribution, setCountyDistribution] = useState<CountyDistribution[]>([]);
  const [countyDistributionLoading, setCountyDistributionLoading] = useState(true);
  const [genderDistribution, setGenderDistribution] = useState<GenderDistribution[]>([]);
  const [genderDistributionLoading, setGenderDistributionLoading] = useState(true);
  


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
      color: '#4CAF50', // 綠色
      loading: true,
      trend: 'up' as 'up' | 'down' | 'neutral',
      data: [45, 52, 48, 58, 65, 72, 68]
    },
    {
      title: '志工人數',
      value: '',
      subtitle: '',
      icon: <People />,
      color: '#2196F3', // 藍色
      loading: true,
      trend: 'up' as 'up' | 'down' | 'neutral',
      data: [12, 15, 18, 22, 25, 28, 24]
    },
    {
      title: '活動總數',
      value: '',
      subtitle: '',
      icon: <CalendarToday />,
      color: '#FF9800', // 橙色
      loading: true,
      trend: 'up' as 'up' | 'down' | 'neutral',
      data: [8, 12, 10, 15, 18, 22, 20]
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
  const convertActivityToCalendarEvent = (activity: any): CalendarEvent & { eventSource: 'activity'; imageUrl?: string } => {
    return {
      id: `activity_${activity.activityId}`,
      title: activity.activityName,
      start: new Date(activity.startDate),
      end: new Date(activity.endDate),
      type: 'activity',
      description: activity.description,
      workerId: activity.workerId,
      status: activity.status,
      eventSource: 'activity',
      imageUrl: activity.imageUrl
    } as CalendarEvent & { eventSource: 'activity'; imageUrl?: string };
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
        let schedules;
        if (userRole === 'admin') {
          // admin 看全部行程
          schedules = await scheduleService.getAllSchedules();
        } else {
          // 其他角色只看自己的行程
          schedules = await scheduleService.getSchedulesByWorker(workerId);
        }
        
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
        console.log(`載入了 ${scheduleEvents.length} 筆行程資料 (${userRole === 'admin' ? '全部' : '個人'})`);
      } catch (scheduleError) {
        console.error('載入行程失敗:', scheduleError);
      }
      
      // 載入活動資料
      try {
        const activityResponse = await activityService.getActivities();
        const activities = activityResponse.activities || [];
        
        // admin 看全部活動，其他角色只看自己的活動
        const userActivities = userRole === 'admin' 
          ? activities // admin 看全部
          : activities.filter(activity => activity.workerId === workerId); // 其他角色只看自己的
        
        const activityEvents = userActivities
          .map(convertActivityToCalendarEvent)
          .filter(event => {
            const eventDate = new Date(event.start);
            const diffTime = eventDate.getTime() - now.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            return diffDays >= 0 && diffDays <= 14; // 未來14天內
          });
        allEvents.push(...activityEvents);
        console.log(`載入了 ${activityEvents.length} 筆活動資料 (${userRole === 'admin' ? '全部' : '個人'})`);
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
          subtitle: `今年成長`,
          icon: <Assignment />,
          color: '#4CAF50', // 綠色
          loading: false,
          trend: stats.casesGrowthPercentage >= 0 ? 'up' : 'down',
          data: [1, 3, 4, 7, 20, 27, 39, 40, 59, 77, 98, 85, 130, 157, 130, 187, 200, 230, 259, 239, 288] // 用戶提供的數據
        },
        {
          title: '志工人數',
          value: stats.totalWorkers.toString(),
          subtitle: `今年成長`,
          icon: <People />,
          color: '#2196F3', // 藍色
          loading: false,
          trend: stats.workersGrowthPercentage >= 0 ? 'up' : 'down',
          data: [34, 35, 40, 58, 67, 53, 49, 32] // 用戶提供的志工人數數據
        },
        {
          title: '活動總數',
          value: stats.totalActivities.toString(),
          subtitle: '今年活動總計',
          icon: <CalendarToday />,
          color: '#FF9800', // 橙色
          loading: false,
          trend: 'up' as const,
          data: [1, 3, 4, 7, 20, 27, 39, 40, 59, 77, 98, 85, 130, 157, 130, 187, 200, 230, 259, 239, 288] // 用戶提供的數據
        }
      ]);
    } catch (error) {
      console.error('載入統計資料失敗:', error);
    }
  };

  // 載入圖表數據
  const loadChartData = async () => {
    try {
      // 獲取當前用戶資訊
      const currentWorker = authService.getCurrentWorker();
      if (!currentWorker) {
        console.warn('未找到登入工作人員資訊');
        return;
      }
      
      const userRole = currentWorker.role;
      console.log(`載入圖表數據 - 用戶: ${currentWorker.name}, 角色: ${userRole}`);
      // 載入性別分佈數據
      try {
        setGenderDistributionLoading(true);
        const genderDistributionResponse = await dashboardService.getGenderDistribution();
        
        // 為新的 GenderChart 組件設置數據
        setGenderDistribution(genderDistributionResponse);
        
        // 為舊版本保留原有邏輯
        const genderChartData = genderDistributionResponse.map((item, index) => ({
          id: index,
          value: item.count,
          label: item.gender === 'Male' ? '男生' : item.gender === 'Female' ? '女生' : item.gender
        }));
        setGenderData(genderChartData);
        setGenderDistributionLoading(false);
      } catch (genderError) {
        console.error('載入性別分佈數據失敗:', genderError);
        setGenderDistributionLoading(false);
      }

      // 載入個案城市分佈數據
      let caseDistribution: any[] = [];
      try {
        caseDistribution = await dashboardService.getCaseDistribution();
        const regionChartData = caseDistribution.map(item => ({
          region: item.city,
          count: item.count
        }));
        setRegionDistributionData(regionChartData);
        console.log('個案城市分佈數據載入成功:', caseDistribution);
      } catch (caseDistError) {
        console.error('載入個案城市分佈數據失敗:', caseDistError);
        setRegionDistributionData([]);
      }

      // 載入困難類型分析數據
      try {
        const difficultyAnalysis = await dashboardService.getDifficultyAnalysis();
        const difficultyChartData = difficultyAnalysis.map(item => ({
          difficulty: item.difficultyType,
          count: item.count
        }));
        setDifficultyData(difficultyChartData);
        console.log('困難類型分析數據載入成功:', difficultyAnalysis);
      } catch (difficultyError) {
        console.error('載入困難類型分析數據失敗:', difficultyError);
        setDifficultyData([]);
      }

      // 載入縣市分佈數據 (用於地圖顯示)
      try {
        setCountyDistributionLoading(true);
        console.log('🌍 開始載入縣市分佈數據...');
        
        const countyDistributionResponse = await dashboardService.getCountyDistribution();
        
        console.log('✅ 縣市分佈數據載入成功:', countyDistributionResponse);
        console.log('📊 縣市分佈資料筆數:', countyDistributionResponse.length);
        
        if (countyDistributionResponse.length === 0) {
          console.warn('⚠️ 縣市分佈資料為空，檢查資料庫是否有個案資料');
        }
        
        // 為新的 RegionChart 組件設置數據
        const mappedData = countyDistributionResponse.map(item => ({
          county: item.county,
          count: item.count
        }));
        
        console.log('🗺️ 設置 RegionChart 資料:', mappedData);
        setCountyDistribution(mappedData);
        
        setCountyDistributionLoading(false);
      } catch (countyError) {
        console.error('❌ 縣市分佈API失敗:', countyError);
        
        // 如果縣市API失敗且有城市資料，使用城市資料作為模擬
        if (caseDistribution.length > 0) {
          console.log('🔄 使用城市資料模擬縣市分佈...');
          
          const simulatedCountyData = caseDistribution.map(item => ({
            county: item.city.includes('市') || item.city.includes('縣') ? item.city : item.city + '市',
            count: item.count
          }));
          
          console.log('🌏 使用模擬縣市數據:', simulatedCountyData);
          
          setCountyDistribution(simulatedCountyData.map(item => ({
            county: item.county,
            count: item.count
          })));
        } else {
          console.error('💥 沒有城市資料可以用於模擬縣市分佈');
          setCountyDistribution([]);
        }
        setCountyDistributionLoading(false);
      }

    } catch (error) {
      console.error('載入圖表數據失敗:', error);
    }
  };

  // 組件載入時載入資料
  useEffect(() => {
    console.log('🔄 Dashboard 組件載入，開始載入資料');
    
    const loadAllData = async () => {
      try {
        console.log('📊 開始載入統計資料...');
        await loadStatistics();
        
        console.log('📈 開始載入圖表資料...');
        await loadChartData();
        
        console.log('📅 開始載入近期活動...');
        await loadRecentEvents();
        
        console.log('✅ 所有資料載入完成');
      } catch (error) {
        console.error('❌ 載入資料時發生錯誤:', error);
      }
    };
    
    loadAllData();
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


      
      {/* 統計卡片 - 使用 MUI X StatCard 組件 */}
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
                sm: 'calc(33.333% - 8px)', 
                md: 'calc(33.333% - 12px)',
                lg: 'calc(33.333% - 16px)'
              },
              minWidth: 0,
              flex: '1 1 auto',
              display: 'flex'
            }}
          >
            <StatCard
              title={card.title}
              value={card.loading ? '' : card.value}
              interval={card.loading ? '' : card.subtitle}
              trend={card.trend}
              data={card.data}
              icon={card.icon}
              loading={card.loading}
            />
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
        {/* 性別分布 - 半圓甜甜圈圖 */}
        <Box 
          sx={{
            flexBasis: { 
              xs: '100%', 
              sm: '100%', 
              md: 'calc(25% - 12px)',
              lg: 'calc(25% - 16px)' 
            },
            minWidth: 0,
            order: { xs: 1, md: 1, lg: 1 }
          }}
        >
          <GenderChart 
            data={genderData}
            loading={genderDistributionLoading}
          />
        </Box>

        {/* 近期活動 */}
        <Box 
          sx={{
            flexBasis: { 
              xs: '100%', 
              sm: '100%', 
              md: 'calc(75% - 12px)',
              lg: 'calc(75% - 16px)' 
            },
            minWidth: 0,
            order: { xs: 2, md: 2, lg: 2 },
            height: 'fit-content'
          }}
        >
          <Card sx={{ 
            boxShadow: { xs: 1, sm: 2 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography 
                gutterBottom 
                sx={{
                  ...commonStyles.cardTitle,
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.125rem' },
                  mb: 2
                }}
              >
                近期活動
              </Typography>
              <Box sx={{ 
                flex: 1,
                overflowY: 'auto',
                minHeight: { xs: 300, sm: 320, md: 350, lg: 400 },
                maxHeight: { xs: 400, sm: 450, md: 500, lg: 550 },
                pr: 1 // 為滾動條留空間
              }}>
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => {
                    const { date, time } = formatEventDateTime(event.start);
                    const eventWithSource = event as CalendarEvent & { eventSource?: 'activity' | 'schedule'; imageUrl?: string };
                    
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
                        mb: { xs: 1.5, sm: 2 }, 
                        p: { xs: 1.5, sm: 2, md: 2, lg: 2.5 },
                        borderRadius: 2,
                        bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                        '&:hover': {
                          bgcolor: THEME_COLORS.PRIMARY_LIGHT_BG,
                          borderColor: THEME_COLORS.PRIMARY,
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        },
                        transition: 'all 0.2s ease',
                        minHeight: { xs: '80px', sm: '85px', md: '90px', lg: '95px' },
                        display: 'flex',
                        gap: { xs: 1.5, sm: 2 },
                        cursor: 'pointer'
                      }}>
                        {/* 活動圖片 - 只有活動才顯示 */}
                        {eventWithSource.eventSource === 'activity' && eventWithSource.imageUrl && (
                          <Box sx={{
                            width: { xs: '60px', sm: '70px', md: '80px', lg: '90px' },
                            height: { xs: '60px', sm: '65px', md: '70px', lg: '75px' },
                            borderRadius: 2,
                            overflow: 'hidden',
                            flexShrink: 0,
                            bgcolor: THEME_COLORS.BACKGROUND_CARD
                          }}>
                            <img 
                              src={eventWithSource.imageUrl} 
                              alt={event.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </Box>
                        )}
                        
                        {/* 活動內容 */}
                        <Box sx={{ 
                          flex: 1, 
                          minWidth: 0,
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
                                fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem', lg: '1rem' },
                                color: THEME_COLORS.TEXT_PRIMARY,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.3
                              }}>
                                {event.title}
                              </Typography>
                              <Typography sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.82rem', lg: '0.85rem' },
                                color: THEME_COLORS.TEXT_MUTED,
                                mt: { xs: 0.25, sm: 0.5 },
                                lineHeight: 1.2
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
                                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.775rem', lg: '0.8rem' },
                                height: { xs: 20, sm: 22, md: 24, lg: 26 },
                                ml: { xs: 1, sm: 1.5 },
                                fontWeight: 500,
                                flexShrink: 0
                              }}
                            />
                          </Box>
                          {event.description && (
                            <Typography sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.82rem' },
                              color: THEME_COLORS.TEXT_SECONDARY,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.3,
                              mt: { xs: 0.25, sm: 0.5 }
                            }}>
                              {event.description}
                            </Typography>
                          )}
                        </Box>
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
          <RegionChart 
            data={countyDistribution} 
            loading={countyDistributionLoading}
          />
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
          <DifficultyRadarChart loading={false} />
        </Box>
      </Box>

    </PageContainer>
  );
};

export default Dashboard;
