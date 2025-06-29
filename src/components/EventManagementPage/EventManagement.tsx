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
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { commonStyles, getStatusStyle, getResponsiveSpacing } from '../../styles/commonStyles';

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
 * 4. 活動資料即時編輯
 * 5. 活動狀態管理和顯示
 * 6. 人數統計和進度追蹤
 * 
 * 特色功能：
 * - 響應式表格設計
 * - 可展開的活動詳情
 * - 即時查詢功能
 * - 直接編輯功能
 * - 狀態標籤和顏色編碼
 * - 人數進度顯示
 */
const EventManagement: React.FC<EventManagementProps> = ({ 
  onSave, 
  onViewDetails 
}) => {
  // 搜尋狀態
  const [searchType, setSearchType] = useState('活動名稱');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // 編輯狀態
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EventRecord | null>(null);

  // 搜尋類型選項
  const searchTypeOptions = ['活動名稱', '地點', '日期', '狀態'];

  // 模擬活動資料
  const [eventRecords, setEventRecords] = useState<EventRecord[]>([
    {
      id: 1,
      name: '雜貨旅遊 x 台積電二手作甜點體驗營',
      date: '2024-06-26',
      location: 'NGO基地 (台北市南港區忠孝東路六段488號)',
      volunteerCount: 15,
      participantCount: 20,
      registeredVolunteers: 12,
      registeredParticipants: 18,
      status: 'upcoming',
      description: '結合雜貨旅遊志工與台積電志工，帶領長者製作甜點，促進世代交流。活動將包含甜點製作教學、分組互動時間以及成果分享。預計能夠增進長者的社交互動，同時讓志工們學習如何與不同年齡層的人溝通。'
    },
    {
      id: 2,
      name: '社區關懷訪問活動',
      date: '2024-06-20',
      location: '台北市信義區',
      volunteerCount: 8,
      participantCount: 12,
      registeredVolunteers: 8,
      registeredParticipants: 10,
      status: 'completed',
      description: '深入社區進行關懷訪問，了解居民需求並提供必要協助。志工將進行家庭訪問，關心獨居長者的生活狀況，提供物資協助和情感支持。'
    },
    {
      id: 3,
      name: '青少年職涯探索工作坊',
      date: '2024-07-05',
      location: '台北市大安區',
      volunteerCount: 12,
      participantCount: 25,
      registeredVolunteers: 10,
      registeredParticipants: 22,
      status: 'upcoming',
      description: '邀請各行業專家分享職涯經驗，協助青少年探索未來方向。工作坊將包含職業介紹、實作體驗和一對一諮詢時間。'
    },
    {
      id: 4,
      name: '環保淨灘活動',
      date: '2024-06-15',
      location: '新北市淡水區',
      volunteerCount: 20,
      participantCount: 0,
      registeredVolunteers: 18,
      registeredParticipants: 0,
      status: 'ongoing',
      description: '響應環保議題，結合志工力量進行海岸線清潔工作。活動包含淨灘、垃圾分類和環保教育。'
    },
    {
      id: 5,
      name: '長者數位學習課程',
      date: '2024-07-12',
      location: '台北市中正區',
      volunteerCount: 6,
      participantCount: 15,
      registeredVolunteers: 5,
      registeredParticipants: 12,
      status: 'upcoming',
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
   * 開始編輯活動
   */
  const handleEdit = (record: EventRecord) => {
    setEditingRow(record.id);
    setEditFormData({ ...record });
  };

  /**
   * 儲存編輯
   */
  const handleSave = () => {
    if (editFormData) {
      setEventRecords(prev => 
        prev.map(record => 
          record.id === editFormData.id 
            ? { ...editFormData }
            : record
        )
      );
      onSave?.(editFormData.id, editFormData);
      setEditingRow(null);
      setEditFormData(null);
      alert('活動資料已成功更新！');
    }
  };

  /**
   * 取消編輯
   */
  const handleCancel = () => {
    setEditingRow(null);
    setEditFormData(null);
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
                      height: editingRow === record.id ? '120px' : 'auto',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      animation: editingRow === record.id ? 'expandEditRow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                      bgcolor: editingRow === record.id 
                        ? THEME_COLORS.SUCCESS_LIGHT 
                        : THEME_COLORS.BACKGROUND_PRIMARY,
                      boxShadow: editingRow === record.id 
                        ? `0 8px 25px ${THEME_COLORS.PRIMARY}25, 0 2px 10px rgba(0,0,0,0.1)` 
                        : 'none',
                      borderLeft: editingRow === record.id 
                        ? `4px solid ${THEME_COLORS.PRIMARY}` 
                        : 'none',
                      zIndex: editingRow === record.id ? 10 : 'auto',
                      '&:hover': { 
                        bgcolor: editingRow === record.id 
                          ? THEME_COLORS.SUCCESS_LIGHT 
                          : THEME_COLORS.BACKGROUND_PRIMARY,
                        transform: editingRow === record.id ? 'none' : 'translateY(-1px)',
                        boxShadow: editingRow === record.id 
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
                      py: editingRow === record.id ? 3 : 1,
                      transition: 'padding 0.4s ease',
                      maxWidth: 280,
                      color: THEME_COLORS.TEXT_PRIMARY
                    }}>
                      {editingRow === record.id ? (
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
                    <TableCell sx={{ py: editingRow === record.id ? 3 : 1 }}>
                      {editingRow === record.id ? (
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
                      py: editingRow === record.id ? 3 : 1,
                      maxWidth: 200
                    }}>
                      {editingRow === record.id ? (
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
                    <TableCell align="center" sx={{ py: editingRow === record.id ? 3 : 1 }}>
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        {editingRow === record.id ? (
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
                    <TableCell sx={{ py: editingRow === record.id ? 3 : 1 }}>
                      {editingRow === record.id ? (
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
                        {editingRow === record.id ? (
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
                              onClick={handleCancel}
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
                          transform: editingRow === record.id ? 'scale(1.01)' : 'scale(1)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          boxShadow: editingRow === record.id ? '0 4px 20px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ 
                            ...commonStyles.cardTitle
                          }}>
                            活動詳細資訊
                          </Typography>
                          
                          {editingRow === record.id ? (
                            // 編輯模式
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <Box>
                                <Typography variant="body2" sx={{ 
                                  ...commonStyles.formLabel 
                                }}>
                                  活動描述
                                </Typography>
                                <TextField
                                  value={editFormData?.description || ''}
                                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                                  multiline
                                  rows={4}
                                  fullWidth
                                  placeholder="請輸入活動描述..."
                                  sx={{ ...commonStyles.formInput }}
                                />
                              </Box>
                            </Box>
                          ) : (
                            // 顯示模式
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <Box sx={{ display: 'flex', gap: 4 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    <strong>活動描述：</strong>
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {record.description}
                                  </Typography>
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
                          )}
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
    </Box>
  );
};

export default EventManagement;
export type { EventRecord }; 