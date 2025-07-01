import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Avatar,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Search,
  Edit,
  Save,
  Cancel,
  ExpandMore,
  ExpandLess,
  Group,
  LocationOn,
  PhotoCamera,
  People,
  Person,
  AccessTime,
  Phone,
  Email,
  Close,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getStatusStyle, getResponsiveSpacing } from '../../styles/commonStyles';

// 報名記錄介面
interface RegistrationRecord {
  id: number;
  name: string;
  phone: string;
  email: string;
  type: 'volunteer' | 'participant';
  registrationDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

/**
 * 活動記錄介面
 */
interface EventRecord {
  id: number;
  name: string;
  date: string;
  location: string;
  volunteerCount: number;
  participantCount: number;
  registeredVolunteers: number;
  registeredParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  description: string;
  // 新增欄位以支援完整的活動編輯
  startDateTime?: string;
  endDateTime?: string;
  registrationDeadline?: string;
  shortDescription?: string;
  eventType?: 'general' | 'case';
  image?: string; // 圖片URL
  registrations?: RegistrationRecord[]; // 報名記錄
}

/**
 * 活動管理組件 Props
 */
interface EventManagementProps {
  onSave?: (eventId: number, data: Partial<EventRecord>) => void;
  onViewDetails?: (eventId: number) => void;
}

/**
 * 活動管理組件 (EventManagement)
 * 
 * 主要功能：
 * 1. 活動查詢和篩選（按名稱、地點、日期、狀態）
 * 2. 活動列表顯示（表格形式）
 * 3. 活動詳情展開查看
 * 4. 活動資料彈窗編輯（包含報名記錄和圖片更新）
 * 5. 活動狀態管理和顯示
 * 6. 人數統計和進度追蹤
 * 
 * 特色功能：
 * - 響應式表格設計
 * - 可展開的活動詳情
 * - 即時查詢功能
 * - 彈窗編輯功能
 * - 狀態標籤和顏色編碼
 * - 報名記錄查看
 * - 圖片上傳更新
 */
const EventManagement: React.FC<EventManagementProps> = ({ 
  onSave, 
  onViewDetails 
}) => {
  // 搜尋狀態
  const [searchType, setSearchType] = useState('活動名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // 編輯對話框狀態
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditRecord, setCurrentEditRecord] = useState<EventRecord | null>(null);
  const [editFormData, setEditFormData] = useState<EventRecord | null>(null);
  const [dialogTab, setDialogTab] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 搜尋類型選項
  const searchTypeOptions = ['活動名稱', '地點', '日期', '狀態'];

  // 模擬報名記錄
  const mockRegistrations: { [key: number]: RegistrationRecord[] } = {
    1: [
      { id: 1, name: '張志工', phone: '0912-345-678', email: 'volunteer1@email.com', type: 'volunteer', registrationDate: '2024-06-20', status: 'confirmed' },
      { id: 2, name: '李志工', phone: '0923-456-789', email: 'volunteer2@email.com', type: 'volunteer', registrationDate: '2024-06-21', status: 'confirmed' },
      { id: 3, name: '王志工', phone: '0934-567-890', email: 'volunteer3@email.com', type: 'volunteer', registrationDate: '2024-06-22', status: 'pending' },
      { id: 4, name: '陳長者', phone: '0945-678-901', email: 'elder1@email.com', type: 'participant', registrationDate: '2024-06-20', status: 'confirmed' },
      { id: 5, name: '林長者', phone: '0956-789-012', email: 'elder2@email.com', type: 'participant', registrationDate: '2024-06-21', status: 'confirmed' },
    ],
    2: [
      { id: 6, name: '黃志工', phone: '0967-890-123', email: 'volunteer4@email.com', type: 'volunteer', registrationDate: '2024-06-15', status: 'confirmed' },
      { id: 7, name: '劉長者', phone: '0978-901-234', email: 'elder3@email.com', type: 'participant', registrationDate: '2024-06-16', status: 'confirmed' },
    ],
    // 其他活動的報名記錄...
  };

  // 模擬活動資料
  const [eventRecords, setEventRecords] = useState<EventRecord[]>([
    {
      id: 1,
      name: '雜貨旅遊 x 台積電二手作甜點體驗營',
      date: '2024-06-26',
      startDateTime: '2024-06-26T09:00',
      endDateTime: '2024-06-26T15:00',
      registrationDeadline: '2024-06-25T18:00',
      location: 'NGO基地 (台北市南港區忠孝東路六段488號)',
      volunteerCount: 15,
      participantCount: 20,
      registeredVolunteers: 12,
      registeredParticipants: 18,
      status: 'upcoming',
      eventType: 'case',
      shortDescription: '結合志工力量帶領長者製作甜點，促進世代交流',
      description: '結合雜貨旅遊志工與台積電志工，帶領長者製作甜點，促進世代交流。活動將包含甜點製作教學、分組互動時間以及成果分享。預計能夠增進長者的社交互動，同時讓志工們學習如何與不同年齡層的人溝通。',
      image: '/images/case-management.jpg'
    },
    {
      id: 2,
      name: '社區關懷訪問活動',
      date: '2024-06-20',
      startDateTime: '2024-06-20T10:00',
      endDateTime: '2024-06-20T16:00',
      registrationDeadline: '2024-06-19T18:00',
      location: '台北市信義區',
      volunteerCount: 8,
      participantCount: 12,
      registeredVolunteers: 8,
      registeredParticipants: 10,
      status: 'completed',
      eventType: 'case',
      shortDescription: '深入社區關懷訪問，提供必要協助',
      description: '深入社區進行關懷訪問，了解居民需求並提供必要協助。志工將進行家庭訪問，關心獨居長者的生活狀況，提供物資協助和情感支持。'
    },
    {
      id: 3,
      name: '青少年職涯探索工作坊',
      date: '2024-07-05',
      startDateTime: '2024-07-05T13:00',
      endDateTime: '2024-07-05T17:00',
      registrationDeadline: '2024-07-04T18:00',
      location: '台北市大安區',
      volunteerCount: 12,
      participantCount: 25,
      registeredVolunteers: 10,
      registeredParticipants: 22,
      status: 'upcoming',
      eventType: 'case',
      shortDescription: '邀請專家分享職涯經驗，協助青少年探索未來',
      description: '邀請各行業專家分享職涯經驗，協助青少年探索未來方向。工作坊將包含職業介紹、實作體驗和一對一諮詢時間。'
    },
    {
      id: 4,
      name: '環保淨灘活動',
      date: '2024-06-15',
      startDateTime: '2024-06-15T08:00',
      endDateTime: '2024-06-15T12:00',
      registrationDeadline: '2024-06-14T18:00',
      location: '新北市淡水區',
      volunteerCount: 20,
      participantCount: 0,
      registeredVolunteers: 18,
      registeredParticipants: 0,
      status: 'ongoing',
      eventType: 'general',
      shortDescription: '響應環保議題，進行海岸線清潔工作',
      description: '響應環保議題，結合志工力量進行海岸線清潔工作。活動包含淨灘、垃圾分類和環保教育。'
    },
    {
      id: 5,
      name: '長者數位學習課程',
      date: '2024-07-12',
      startDateTime: '2024-07-12T14:00',
      endDateTime: '2024-07-12T16:00',
      registrationDeadline: '2024-07-11T18:00',
      location: '台北市中正區',
      volunteerCount: 6,
      participantCount: 15,
      registeredVolunteers: 5,
      registeredParticipants: 12,
      status: 'upcoming',
      eventType: 'case',
      shortDescription: '協助長者學習基礎數位技能',
      description: '協助長者學習基礎數位技能，包含智慧型手機使用、線上購物和視訊通話等實用功能。'
    }
  ]);

  /**
   * 處理查詢
   */
  const handleSearch = () => {
    console.log('查詢:', { type: searchType, content: searchContent });
    // TODO: 實作查詢邏輯
  };

  /**
   * 切換列展開狀態
   */
  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  /**
   * 開始編輯活動 - 開啟對話框
   */
  const handleEdit = (record: EventRecord) => {
    setCurrentEditRecord(record);
    setEditFormData({ ...record });
    setImagePreview(record.image || null);
    setDialogTab(0);
    setEditDialogOpen(true);
  };

  /**
   * 關閉編輯對話框
   */
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentEditRecord(null);
    setEditFormData(null);
    setImagePreview(null);
    setDialogTab(0);
  };

  /**
   * 儲存編輯
   */
  const handleSave = () => {
    if (editFormData && currentEditRecord) {
      // 計算實際報名人數
      const registrations = mockRegistrations[editFormData.id] || [];
      const confirmedVolunteers = registrations.filter(r => r.type === 'volunteer' && r.status === 'confirmed').length;
      const confirmedParticipants = registrations.filter(r => r.type === 'participant' && r.status === 'confirmed').length;
      
      const updatedRecord = {
        ...editFormData,
        registeredVolunteers: confirmedVolunteers,
        registeredParticipants: confirmedParticipants,
        image: imagePreview || editFormData.image
      };

      setEventRecords(prev => 
        prev.map(record => 
          record.id === editFormData.id 
            ? updatedRecord
            : record
        )
      );
      onSave?.(editFormData.id, updatedRecord);
      handleCloseEditDialog();
      alert('活動資料已成功更新！');
    }
  };

  /**
   * 編輯輸入變更
   */
  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData(prev => 
      prev ? { ...prev, [field]: value } : null
    );
  };

  /**
   * 處理圖片上傳
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 檢查檔案大小 (限制 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片檔案大小不能超過 5MB');
        return;
      }

      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案');
        return;
      }

      // 創建預覽 URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  /**
   * 移除圖片
   */
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  /**
   * 取得狀態顏色
   */
  const getStatusColor = (status: EventRecord['status']) => {
    const statusStyles = commonStyles.statusChip;
    switch (status) {
      case 'upcoming': return statusStyles.upcoming;
      case 'ongoing': return statusStyles.ongoing;
      case 'completed': return statusStyles.completed;
      case 'cancelled': return statusStyles.cancelled;
      default: return statusStyles.default;
    }
  };

  /**
   * 取得狀態標籤
   */
  const getStatusLabel = (status: EventRecord['status']) => {
    switch (status) {
      case 'upcoming': return '即將開始';
      case 'ongoing': return '進行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  /**
   * 取得報名狀態顏色
   */
  const getRegistrationStatusColor = (status: RegistrationRecord['status']) => {
    switch (status) {
      case 'confirmed': return THEME_COLORS.SUCCESS;
      case 'pending': return THEME_COLORS.WARNING;
      case 'cancelled': return THEME_COLORS.ERROR;
      default: return THEME_COLORS.TEXT_MUTED;
    }
  };

  /**
   * 取得報名狀態標籤
   */
  const getRegistrationStatusLabel = (status: RegistrationRecord['status']) => {
    switch (status) {
      case 'confirmed': return '已確認';
      case 'pending': return '待確認';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  // 狀態選項
  const statusOptions = [
    { value: 'upcoming', label: '即將開始' },
    { value: 'ongoing', label: '進行中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
  ];

  return (
    <Box>
      {/* 查詢區域 */}
      <Paper elevation={1} sx={{ ...commonStyles.formSection }}>
        <Typography variant="h6" sx={{ ...commonStyles.formHeader }}>
          查詢條件
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            size="small"
            sx={{ 
              minWidth: 120,
              ...commonStyles.formSelect
            }}
          >
            {searchTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
          <TextField
            placeholder={`請輸入${searchType}`}
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            size="small"
            sx={{ 
              flex: 1, 
              minWidth: 250,
              ...commonStyles.formInput
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search sx={{ color: THEME_COLORS.TEXT_MUTED }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            size="small"
            startIcon={<Search />}
            sx={{
              ...commonStyles.primaryButton,
              px: 3,
              py: 1,
            }}
          >
            查詢
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchContent('');
              setSearchType('活動名稱');
            }}
            size="small"
            sx={{
              ...commonStyles.secondaryButton,
              px: 3,
              py: 1,
            }}
          >
            重置
          </Button>
        </Box>
      </Paper>

      {/* 活動列表 */}
      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}` 
        }}>
          <Typography variant="h6" sx={{ ...commonStyles.cardTitle }}>
            活動列表 ({eventRecords.length} 項活動)
          </Typography>
        </Box>
        <TableContainer sx={{ 
          maxWidth: '100%',
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 800, sm: 900, md: 1000 },
            width: '100%'
          }
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
                position: 'sticky',
                top: 0,
                zIndex: 100,
                '& .MuiTableCell-head': {
                  position: 'relative',
                  zIndex: 101
                }
              }}>
                <TableCell width="50" sx={{ 
                  ...commonStyles.tableHeader,
                  py: 2,
                }}>
                  展開
                </TableCell>
                <TableCell sx={{ 
                  ...commonStyles.tableHeader,
                  py: 2,
                }}>
                  活動名稱
                </TableCell>
                <TableCell sx={{ 
                  ...commonStyles.tableHeader,
                  py: 2,
                }}>
                  日期
                </TableCell>
                <TableCell sx={{ 
                  ...commonStyles.tableHeader,
                  py: 2,
                }}>
                  地點
                </TableCell>
                <TableCell sx={{ 
                  ...commonStyles.tableHeader,
                  py: 2,
                }} align="center">
                  人數狀況
                </TableCell>
                <TableCell sx={{ 
                  ...commonStyles.tableHeader,
                  py: 2,
                }}>
                  狀態
                </TableCell>
                <TableCell sx={{ 
                  ...commonStyles.tableHeader,
                  py: 2,
                }} width="120">
                  編輯
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventRecords.map((record) => (
                <React.Fragment key={record.id}>
                  <TableRow 
                    hover 
                    sx={{ 
                      position: 'relative',
                      height: editDialogOpen && record.id === currentEditRecord?.id ? '120px' : 'auto',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      animation: editDialogOpen && record.id === currentEditRecord?.id ? 'expandEditRow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                      bgcolor: editDialogOpen && record.id === currentEditRecord?.id 
                        ? THEME_COLORS.SUCCESS_LIGHT 
                        : THEME_COLORS.BACKGROUND_PRIMARY,
                      boxShadow: editDialogOpen && record.id === currentEditRecord?.id 
                        ? `0 8px 25px ${THEME_COLORS.PRIMARY}25, 0 2px 10px rgba(0,0,0,0.1)` 
                        : 'none',
                      borderLeft: editDialogOpen && record.id === currentEditRecord?.id 
                        ? `4px solid ${THEME_COLORS.PRIMARY}` 
                        : 'none',
                      zIndex: editDialogOpen && record.id === currentEditRecord?.id ? 10 : 'auto',
                      '&:hover': { 
                        bgcolor: editDialogOpen && record.id === currentEditRecord?.id 
                          ? THEME_COLORS.SUCCESS_LIGHT 
                          : THEME_COLORS.BACKGROUND_PRIMARY,
                        transform: editDialogOpen && record.id === currentEditRecord?.id ? 'none' : 'translateY(-1px)',
                        boxShadow: editDialogOpen && record.id === currentEditRecord?.id 
                          ? `0 8px 25px ${THEME_COLORS.PRIMARY}25, 0 2px 10px rgba(0,0,0,0.1)` 
                          : '0 2px 8px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(record.id)}
                        sx={{ 
                          color: THEME_COLORS.TEXT_MUTED,
                          transition: 'all 0.3s ease',
                          transform: expandedRows.includes(record.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                          '&:hover': { 
                            bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                            transform: expandedRows.includes(record.id) ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1.1)'
                          }
                        }}
                      >
                        {expandedRows.includes(record.id) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ 
                      py: editDialogOpen && record.id === currentEditRecord?.id ? 3 : 1,
                      transition: 'padding 0.4s ease',
                      maxWidth: 280,
                      color: THEME_COLORS.TEXT_PRIMARY
                    }}>
                      {editDialogOpen && record.id === currentEditRecord?.id ? (
                        <TextField
                          value={editFormData?.name || ''}
                          onChange={(e) => handleEditInputChange('name', e.target.value)}
                          size="small"
                          fullWidth
                          sx={{ ...commonStyles.formInput }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500,
                          color: THEME_COLORS.TEXT_PRIMARY,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {record.name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: editDialogOpen && record.id === currentEditRecord?.id ? 3 : 1 }}>
                      {editDialogOpen && record.id === currentEditRecord?.id ? (
                        <TextField
                          type="date"
                          value={editFormData?.date || ''}
                          onChange={(e) => handleEditInputChange('date', e.target.value)}
                          size="small"
                          sx={{ ...commonStyles.formInput }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
                          {record.date}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ 
                      py: editDialogOpen && record.id === currentEditRecord?.id ? 3 : 1,
                      maxWidth: 200
                    }}>
                      {editDialogOpen && record.id === currentEditRecord?.id ? (
                        <TextField
                          value={editFormData?.location || ''}
                          onChange={(e) => handleEditInputChange('location', e.target.value)}
                          size="small"
                          fullWidth
                          sx={{ ...commonStyles.formInput }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: THEME_COLORS.TEXT_MUTED }} />
                          <Typography variant="body2" sx={{ 
                            color: THEME_COLORS.TEXT_SECONDARY,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {record.location}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ py: editDialogOpen && record.id === currentEditRecord?.id ? 3 : 1 }}>
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        {editDialogOpen && record.id === currentEditRecord?.id ? (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 1,
                            animation: 'slideDownExpand 0.5s ease-out'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption">志工:</Typography>
                              <TextField
                                type="number"
                                value={editFormData?.volunteerCount || ''}
                                onChange={(e) => handleEditInputChange('volunteerCount', parseInt(e.target.value) || 0)}
                                size="small"
                                sx={{ 
                                  width: 60,
                                  ...commonStyles.formInput
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption">個案:</Typography>
                              <TextField
                                type="number"
                                value={editFormData?.participantCount || ''}
                                onChange={(e) => handleEditInputChange('participantCount', parseInt(e.target.value) || 0)}
                                size="small"
                                sx={{ 
                                  width: 60,
                                  ...commonStyles.formInput
                                }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Group sx={{ fontSize: 14, color: THEME_COLORS.TEXT_MUTED }} />
                              <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
                                志工: {record.volunteerCount}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
                              個案: {record.participantCount}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: editDialogOpen && record.id === currentEditRecord?.id ? 3 : 1 }}>
                      {editDialogOpen && record.id === currentEditRecord?.id ? (
                        <Select
                          value={editFormData?.status || ''}
                          onChange={(e) => handleEditInputChange('status', e.target.value)}
                          size="small"
                          fullWidth
                          sx={{ ...commonStyles.formSelect }}
                        >
                          {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Chip 
                          label={getStatusLabel(record.status)} 
                          size="small" 
                          sx={{
                            ...getStatusStyle(record.status),
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {editDialogOpen && record.id === currentEditRecord?.id ? (
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 1,
                            animation: 'slideDownExpand 0.5s ease-out'
                          }}>
                            <IconButton 
                              size="small" 
                              onClick={handleSave}
                              sx={{ 
                                color: THEME_COLORS.SUCCESS,
                                transition: 'all 0.2s ease',
                                '&:hover': { 
                                  bgcolor: THEME_COLORS.SUCCESS_LIGHT,
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Save />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={handleCloseEditDialog}
                              sx={{ 
                                color: THEME_COLORS.ERROR,
                                transition: 'all 0.2s ease',
                                '&:hover': { 
                                  bgcolor: THEME_COLORS.ERROR_LIGHT,
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Cancel />
                            </IconButton>
                          </Box>
                        ) : (
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(record)}
                            sx={{ 
                              color: THEME_COLORS.PRIMARY,
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                bgcolor: THEME_COLORS.SUCCESS_LIGHT,
                                transform: 'scale(1.1) rotate(5deg)'
                              }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedRows.includes(record.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                          margin: 2, 
                          p: 4, 
                          bgcolor: THEME_COLORS.BACKGROUND_PRIMARY, 
                          borderRadius: 2,
                          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                          animation: expandedRows.includes(record.id) ? 'expandDetails 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                          transform: editDialogOpen && record.id === currentEditRecord?.id ? 'scale(1.01)' : 'scale(1)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          boxShadow: editDialogOpen && record.id === currentEditRecord?.id ? '0 4px 20px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ 
                            ...commonStyles.cardTitle
                          }}>
                            活動詳細資訊
                          </Typography>
                          
                                                     {/* 顯示模式 */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {/* 第一行：活動類型和時間資訊 */}
                              <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    <strong>活動類型：</strong>
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    {record.eventType === 'case' ? (
                                      <>
                                        <Person sx={{ fontSize: 16, color: THEME_COLORS.PRIMARY }} />
                                        <Typography variant="body2" sx={{ color: THEME_COLORS.PRIMARY, fontWeight: 500 }}>
                                          個案活動
                                        </Typography>
                                      </>
                                    ) : (
                                      <>
                                        <People sx={{ fontSize: 16, color: THEME_COLORS.INFO }} />
                                        <Typography variant="body2" sx={{ color: THEME_COLORS.INFO, fontWeight: 500 }}>
                                          志工活動
                                        </Typography>
                                      </>
                                    )}
                                  </Box>
                                  
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    <strong>時間資訊：</strong>
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <AccessTime sx={{ fontSize: 14, color: THEME_COLORS.TEXT_MUTED }} />
                                      <Typography variant="body2">
                                        開始：{record.startDateTime ? new Date(record.startDateTime).toLocaleString('zh-TW') : '未設定'}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2.5 }}>
                                      <Typography variant="body2">
                                        結束：{record.endDateTime ? new Date(record.endDateTime).toLocaleString('zh-TW') : '未設定'}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2.5 }}>
                                      <Typography variant="body2" color="warning.main">
                                        報名截止：{record.registrationDeadline ? new Date(record.registrationDeadline).toLocaleString('zh-TW') : '未設定'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                                
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    <strong>報名狀況：</strong>
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2">志工報名：</Typography>
                                      <Typography variant="body2" color={
                                        record.registeredVolunteers >= record.volunteerCount ? 'success.main' : 'warning.main'
                                      }>
                                        {record.registeredVolunteers}/{record.volunteerCount} 人
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2">個案報名：</Typography>
                                      <Typography variant="body2" color={
                                        record.registeredParticipants >= record.participantCount ? 'success.main' : 'warning.main'
                                      }>
                                        {record.registeredParticipants}/{record.participantCount} 人
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>

                              {/* 第二行：活動描述 */}
                              <Box>
                                {record.shortDescription && (
                                  <>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      <strong>活動簡述：</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                      {record.shortDescription}
                                    </Typography>
                                  </>
                                )}
                                
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  <strong>活動詳細描述：</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {record.description}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  onClick={() => handleEdit(record)}
                                  sx={{
                                    ...commonStyles.secondaryButton,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      ...commonStyles.secondaryButton['&:hover'],
                                      transform: 'scale(1.05)'
                                    }
                                  }}
                                >
                                  編輯活動
                                </Button>
                                <Button 
                                  variant="text" 
                                  size="small"
                                  onClick={() => onViewDetails?.(record.id)}
                                  sx={{
                                    color: THEME_COLORS.PRIMARY,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: THEME_COLORS.SUCCESS_LIGHT,
                                      transform: 'scale(1.05)'
                                    }
                                  }}
                                >
                                  查看詳情
                                </Button>
                              </Box>
                            </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* 分頁區域（預留） */}
        <Box sx={{ 
          p: 3, 
          borderTop: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            顯示 1-{eventRecords.length} 筆，共 {eventRecords.length} 項活動
          </Typography>
        </Box>
      </Paper>

      {/* 編輯對話框 */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3, 
          pb: 1,
          borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            活動管理 - {currentEditRecord?.name}
          </Typography>
          <IconButton 
            onClick={handleCloseEditDialog}
            size="small"
            sx={{ color: THEME_COLORS.TEXT_MUTED }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={dialogTab} 
            onChange={(_, newValue) => setDialogTab(newValue)}
            sx={{ px: 3 }}
          >
            <Tab 
              label="編輯活動" 
              icon={<Edit />}
              iconPosition="start"
              sx={{ fontWeight: 500 }}
            />
            <Tab 
              label="報名記錄" 
              icon={<Group />}
              iconPosition="start"
              sx={{ fontWeight: 500 }}
            />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {dialogTab === 0 && (
            <Box sx={{ p: 3 }}>
              {/* 編輯表單 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 活動類型（不可修改） */}
                <Box>
                  <Typography variant="body2" sx={{ 
                    ...commonStyles.formLabel,
                    mb: 1
                  }}>
                    活動類型（建立後不可更改）
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant={editFormData?.eventType === 'general' ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<People />}
                      disabled
                      sx={{ 
                        color: editFormData?.eventType === 'general' ? 'white' : THEME_COLORS.INFO,
                        bgcolor: editFormData?.eventType === 'general' ? THEME_COLORS.INFO : 'transparent',
                        borderColor: THEME_COLORS.INFO,
                        opacity: 0.6
                      }}
                    >
                      志工
                    </Button>
                    <Button
                      variant={editFormData?.eventType === 'case' ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<Person />}
                      disabled
                      sx={{ 
                        color: editFormData?.eventType === 'case' ? 'white' : THEME_COLORS.PRIMARY,
                        bgcolor: editFormData?.eventType === 'case' ? THEME_COLORS.PRIMARY : 'transparent',
                        borderColor: THEME_COLORS.PRIMARY,
                        opacity: 0.6
                      }}
                    >
                      個案
                    </Button>
                  </Box>
                </Box>

                {/* 活動名稱 */}
                <Box>
                  <Typography variant="body2" sx={{ 
                    ...commonStyles.formLabel 
                  }}>
                    活動名稱 *
                  </Typography>
                  <TextField
                    value={editFormData?.name || ''}
                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                    fullWidth
                    placeholder="請輸入活動名稱..."
                    sx={{ ...commonStyles.formInput }}
                  />
                </Box>

                {/* 時間設定 */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ 
                      ...commonStyles.formLabel 
                    }}>
                      開始時間 *
                    </Typography>
                    <TextField
                      type="datetime-local"
                      value={editFormData?.startDateTime || ''}
                      onChange={(e) => handleEditInputChange('startDateTime', e.target.value)}
                      fullWidth
                      sx={{ ...commonStyles.formInput }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ 
                      ...commonStyles.formLabel 
                    }}>
                      結束時間 *
                    </Typography>
                    <TextField
                      type="datetime-local"
                      value={editFormData?.endDateTime || ''}
                      onChange={(e) => handleEditInputChange('endDateTime', e.target.value)}
                      fullWidth
                      sx={{ ...commonStyles.formInput }}
                    />
                  </Box>
                </Box>

                {/* 報名截止日和地點 */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ 
                      ...commonStyles.formLabel 
                    }}>
                      報名截止日 *
                    </Typography>
                    <TextField
                      type="datetime-local"
                      value={editFormData?.registrationDeadline || ''}
                      onChange={(e) => handleEditInputChange('registrationDeadline', e.target.value)}
                      fullWidth
                      sx={{ ...commonStyles.formInput }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ 
                      ...commonStyles.formLabel 
                    }}>
                      活動地點 *
                    </Typography>
                    <TextField
                      value={editFormData?.location || ''}
                      onChange={(e) => handleEditInputChange('location', e.target.value)}
                      fullWidth
                      placeholder="請輸入活動地點..."
                      sx={{ ...commonStyles.formInput }}
                    />
                  </Box>
                </Box>

                {/* 需求人數（顯示，不可編輯） */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ 
                      ...commonStyles.formLabel 
                    }}>
                      需求志工人數（系統自動計算）
                    </Typography>
                    <TextField
                      value={`${editFormData?.registeredVolunteers || 0}/${editFormData?.volunteerCount || 0} 人`}
                      fullWidth
                      disabled
                      sx={{ 
                        ...commonStyles.formInput,
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: THEME_COLORS.TEXT_SECONDARY
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ 
                      ...commonStyles.formLabel 
                    }}>
                      需求個案人數（系統自動計算）
                    </Typography>
                    <TextField
                      value={`${editFormData?.registeredParticipants || 0}/${editFormData?.participantCount || 0} 人`}
                      fullWidth
                      disabled
                      sx={{ 
                        ...commonStyles.formInput,
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: THEME_COLORS.TEXT_SECONDARY
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* 活動狀態 */}
                <Box>
                  <Typography variant="body2" sx={{ 
                    ...commonStyles.formLabel 
                  }}>
                    活動狀態 *
                  </Typography>
                  <Select
                    value={editFormData?.status || ''}
                    onChange={(e) => handleEditInputChange('status', e.target.value)}
                    fullWidth
                    sx={{ ...commonStyles.formInput }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* 活動簡述 */}
                <Box>
                  <Typography variant="body2" sx={{ 
                    ...commonStyles.formLabel 
                  }}>
                    活動簡述 *
                  </Typography>
                  <TextField
                    value={editFormData?.shortDescription || ''}
                    onChange={(e) => handleEditInputChange('shortDescription', e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    placeholder="請簡單描述活動內容..."
                    sx={{ ...commonStyles.formInput }}
                  />
                </Box>

                {/* 活動詳細描述 */}
                <Box>
                  <Typography variant="body2" sx={{ 
                    ...commonStyles.formLabel 
                  }}>
                    活動詳細描述
                  </Typography>
                  <TextField
                    value={editFormData?.description || ''}
                    onChange={(e) => handleEditInputChange('description', e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="請輸入活動詳細描述..."
                    sx={{ ...commonStyles.formInput }}
                  />
                </Box>

                {/* 圖片上傳 */}
                <Box>
                  <Typography variant="body2" sx={{ 
                    ...commonStyles.formLabel 
                  }}>
                    活動圖片
                  </Typography>
                  
                  {/* 當前圖片預覽 */}
                  {(imagePreview || editFormData?.image) && (
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={imagePreview || editFormData?.image}
                        alt="活動圖片預覽"
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
                        }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleRemoveImage}
                        sx={{ mt: 1 }}
                      >
                        移除圖片
                      </Button>
                    </Box>
                  )}
                  
                  {/* 上傳按鈕 */}
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="event-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="event-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      sx={{ ...commonStyles.secondaryButton }}
                    >
                      {imagePreview || editFormData?.image ? '更換圖片' : '上傳圖片'}
                    </Button>
                  </label>
                  
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: THEME_COLORS.TEXT_MUTED }}>
                    支援 JPG、PNG 格式，檔案大小限制 5MB
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {dialogTab === 1 && (
            <Box sx={{ p: 3 }}>
              {/* 報名記錄 */}
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                報名記錄總覽
              </Typography>
              
              {mockRegistrations[editFormData?.id || 0] ? (
                <List>
                  {mockRegistrations[editFormData?.id || 0].map((registration, index) => (
                    <React.Fragment key={registration.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: registration.type === 'volunteer' 
                              ? THEME_COLORS.INFO 
                              : THEME_COLORS.PRIMARY 
                          }}>
                            {registration.type === 'volunteer' ? <People /> : <Person />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {registration.name}
                              </Typography>
                                                             <Chip
                                 label={registration.type === 'volunteer' ? '志工' : '個案'}
                                 size="small"
                                 sx={{
                                   bgcolor: registration.type === 'volunteer' 
                                     ? '#e3f2fd' 
                                     : THEME_COLORS.PRIMARY_LIGHT_BG,
                                   color: registration.type === 'volunteer'
                                     ? THEME_COLORS.INFO
                                     : THEME_COLORS.PRIMARY
                                 }}
                               />
                              <Chip
                                label={getRegistrationStatusLabel(registration.status)}
                                size="small"
                                sx={{
                                  bgcolor: `${getRegistrationStatusColor(registration.status)}15`,
                                  color: getRegistrationStatusColor(registration.status)
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Phone sx={{ fontSize: 14, color: THEME_COLORS.TEXT_MUTED }} />
                                  <Typography variant="caption">
                                    {registration.phone}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Email sx={{ fontSize: 14, color: THEME_COLORS.TEXT_MUTED }} />
                                  <Typography variant="caption">
                                    {registration.email}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                報名日期：{new Date(registration.registrationDate).toLocaleDateString('zh-TW')}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < mockRegistrations[editFormData?.id || 0].length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    暫無報名記錄
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, borderTop: `1px solid ${THEME_COLORS.BORDER_LIGHT}` }}>
          <Button 
            onClick={handleCloseEditDialog}
            sx={{ ...commonStyles.secondaryButton }}
          >
            取消
          </Button>
          {dialogTab === 0 && (
            <Button 
              onClick={handleSave}
              variant="contained"
              sx={{ ...commonStyles.primaryButton }}
            >
              儲存變更
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManagement;
export type { EventRecord }; 