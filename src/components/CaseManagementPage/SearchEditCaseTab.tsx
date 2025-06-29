import React, { useState } from 'react';
import { 
  Box, 
  TextField,
  InputAdornment,
  Paper,
  Button,
  Select,
  MenuItem,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import { 
  Search,
  Edit,
  Save,
  Cancel,
  ExpandMore,
  ExpandLess,
  PhotoCamera,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { THEME_COLORS, theme } from '../../styles/theme';
import { commonStyles, getValidationStyle, getResponsiveSpacing, getStatusStyle } from '../../styles/commonStyles';

interface CaseRecord {
  id: number;
  name: string;
  gender: string;
  birthDate: string;
  idNumber: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  email: string;
  difficulty: string;
  status: 'active' | 'completed';
  avatar?: string;
}

const SearchEditCaseTab: React.FC = () => {
  const [searchType, setSearchType] = useState('姓名');
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<CaseRecord | null>(null);
  const [showIdRows, setShowIdRows] = useState<number[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  
  // 模擬個案資料 - 完整欄位對應新增個案頁面
  const [caseRecords, setCaseRecords] = useState<CaseRecord[]>([
    {
      id: 1,
      name: '張閔凱',
      gender: '男',
      birthDate: '1995-01-01',
      idNumber: 'A123456789',
      phone: '0972628466',
      city: '台中市',
      district: '南屯區',
      address: '文心路一段315號',
      email: 'zhang.minkai@gmail.com',
      difficulty: '經濟困難',
      status: 'active',
      avatar: '/images/avatar1.jpg'
    },
    {
      id: 2,
      name: '李小花',
      gender: '女',
      birthDate: '1998-08-20',
      idNumber: 'B987654321',
      phone: '0923456789',
      city: '台北市',
      district: '信義區',
      address: '信義路100號',
      email: 'li.xiaohua@gmail.com',
      difficulty: '家庭問題',
      status: 'completed',
      avatar: '/images/avatar2.jpg'
    },
    {
      id: 3,
      name: '王小華',
      gender: '男',
      birthDate: '1997-03-10',
      idNumber: 'C456789123',
      phone: '0934567890',
      city: '高雄市',
      district: '前鎮區',
      address: '復興路300號',
      email: 'wang.xiaohua@gmail.com',
      difficulty: '學習困難',
      status: 'active'
    },
    {
      id: 4,
      name: '陳小美',
      gender: '女',
      birthDate: '1999-11-25',
      idNumber: 'D789123456',
      phone: '0945678901',
      city: '台南市',
      district: '東區',
      address: '建國路400號',
      email: 'chen.xiaomei@gmail.com',
      difficulty: '情緒困擾',
      status: 'completed'
    },
  ]);

  const handleSearch = () => {
    console.log('查詢條件:', { searchType, searchContent });
    // TODO: 實作查詢邏輯
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleEdit = (record: CaseRecord) => {
    setEditingRow(record.id);
    setEditFormData({ ...record });
    setFieldErrors({});
    // 自動展開該行以顯示詳細編輯資料
    if (!expandedRows.includes(record.id)) {
      setExpandedRows(prev => [...prev, record.id]);
    }
  };

  const handleSave = () => {
    if (editFormData) {
      // 簡單驗證
      const errors: { [key: string]: boolean } = {};
      if (!editFormData.name.trim()) errors.name = true;
      if (!editFormData.phone.trim()) errors.phone = true;
      if (!editFormData.email.trim()) errors.email = true;
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      setCaseRecords(prev => 
        prev.map(record => 
          record.id === editFormData.id 
            ? { ...editFormData }
            : record
        )
      );
      setEditingRow(null);
      setEditFormData(null);
      setFieldErrors({});
      alert('個案資料已成功更新！');
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditFormData(null);
    setFieldErrors({});
  };

  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData(prev => 
      prev ? { ...prev, [field]: value } : null
    );
    // 清除該欄位的錯誤狀態
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const toggleIdVisibility = (id: number) => {
    setShowIdRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, recordId: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        handleEditInputChange('avatar', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // 搜尋類型選項
  const searchTypeOptions = ['姓名', '電話', '地址', '身分證字號', 'Email'];

  // 狀態選項
  const statusOptions = [
    { value: 'active', label: '進行中' },
    { value: 'completed', label: '已完成' }
  ];

  // 性別選項
  const genderOptions = ['男', '女'];

  // 城市選項
  const cityOptions = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'];

  // 地區選項
  const districtOptions = [
    '中正區', '大同區', '中山區', '松山區', '大安區', '萬華區',
    '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區',
    '板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區',
    '中區', '東區', '南區', '西區', '北區', '西屯區', '南屯區', '北屯區',
    '前鎮區', '鳳山區', '左營區', '楠梓區', '三民區', '苓雅區'
  ];

  // 困難類型選項
  const difficultyOptions = [
    '經濟困難', '家庭問題', '學習困難', '健康問題', '行為問題', 
    '人際關係', '情緒困擾', '其他困難'
  ];

  return (
    <Box>
      {/* 搜尋區域 */}
      <Paper sx={{ ...commonStyles.formSection }}>
        <Typography variant="h6" sx={{ ...commonStyles.formHeader }}>
          查詢條件
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: getResponsiveSpacing('md'), 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            size="small"
            sx={{ 
              ...commonStyles.formSelect,
              minWidth: 120 
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
              ...commonStyles.searchBox,
              flex: 1, 
              minWidth: 250 
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
              setSearchType('姓名');
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

      {/* 個案列表 */}
      <Paper sx={{ ...commonStyles.formSection, p: 0 }}>
        <Box sx={{ 
          p: getResponsiveSpacing('md'), 
          borderBottom: `1px solid ${THEME_COLORS.BORDER_LIGHT}` 
        }}>
          <Typography variant="h6" sx={{ ...commonStyles.cardTitle }}>
            個案列表 ({caseRecords.length} 筆資料)
          </Typography>
        </Box>
        <TableContainer sx={{ 
          maxWidth: '100%',
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 700, sm: 750, md: 800 }, // 響應式最小寬度，移除地址欄位後調整
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
                <TableCell width="50" sx={{ ...commonStyles.tableHeader }}>
                  展開
                </TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>
                  照片/姓名
                </TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>
                  性別
                </TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>
                  生日
                </TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>
                  電話
                </TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }}>
                  狀態
                </TableCell>
                <TableCell sx={{ ...commonStyles.tableHeader }} width="120">
                  修改
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {caseRecords.map((record) => (
                <React.Fragment key={record.id}>
                  <TableRow 
                    hover 
                    sx={{ 
                      ...(editingRow === record.id && commonStyles.editableRow),
                      position: 'relative',
                      '&:hover': { 
                        bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <TableCell sx={{ ...commonStyles.tableCell }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(record.id)}
                        sx={{ 
                          color: THEME_COLORS.TEXT_MUTED,
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
                    <TableCell sx={{ ...commonStyles.tableCell }}>
                      <Box sx={{ ...commonStyles.animations.fadeIn }}>
                        {editingRow === record.id ? (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            minHeight: '80px',
                            ...commonStyles.animations.slideIn
                          }}>
                            <Box sx={{ position: 'relative' }}>
                              <Avatar
                                src={editFormData?.avatar}
                                sx={{ 
                                  width: 50, 
                                  height: 50,
                                  bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                                  color: THEME_COLORS.TEXT_MUTED,
                                }}
                              >
                                {editFormData?.avatar ? '' : <PhotoCamera />}
                              </Avatar>
                              <input
                                hidden
                                accept="image/*"
                                type="file"
                                id={`photo-upload-${record.id}`}
                                onChange={(e) => handleImageUpload(e, record.id)}
                              />
                              <label htmlFor={`photo-upload-${record.id}`}>
                                <IconButton
                                  component="span"
                                  size="small"
                                  sx={{ 
                                    position: 'absolute',
                                    top: -5,
                                    right: -5,
                                    bgcolor: THEME_COLORS.PRIMARY,
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: THEME_COLORS.PRIMARY_DARK,
                                    },
                                    width: 20,
                                    height: 20,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  <PhotoCamera sx={{ fontSize: '0.75rem' }} />
                                </IconButton>
                              </label>
                            </Box>
                            <TextField
                              value={editFormData?.name || ''}
                              onChange={(e) => handleEditInputChange('name', e.target.value)}
                              size="small"
                              placeholder="姓名"
                              sx={{ 
                                ...getValidationStyle(fieldErrors.name),
                                flex: 1,
                                minWidth: 100
                              }}
                            />
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={record.avatar}
                              sx={{ 
                                width: 40, 
                                height: 40,
                                bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                                color: THEME_COLORS.TEXT_MUTED 
                              }}
                            >
                              {record.avatar ? '' : record.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ 
                              color: THEME_COLORS.TEXT_PRIMARY,
                              fontWeight: 500 
                            }}>
                              {record.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...commonStyles.tableCell }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {editingRow === record.id ? (
                          <Select
                            value={editFormData?.gender || ''}
                            onChange={(e) => handleEditInputChange('gender', e.target.value)}
                            size="small"
                            sx={{ 
                              ...commonStyles.formSelect,
                              minWidth: 80,
                              ...commonStyles.animations.slideIn
                            }}
                          >
                            {genderOptions.map((gender) => (
                              <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <Typography variant="body2" sx={{ 
                            color: THEME_COLORS.TEXT_SECONDARY 
                          }}>
                            {record.gender}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...commonStyles.tableCell }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {editingRow === record.id ? (
                          <TextField
                            type="date"
                            value={editFormData?.birthDate || ''}
                            onChange={(e) => handleEditInputChange('birthDate', e.target.value)}
                            size="small"
                            sx={{ 
                              ...commonStyles.formInput,
                              minWidth: 150,
                              ...commonStyles.animations.slideIn
                            }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ 
                            color: THEME_COLORS.TEXT_SECONDARY 
                          }}>
                            {record.birthDate}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...commonStyles.tableCell }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {editingRow === record.id ? (
                          <TextField
                            value={editFormData?.phone || ''}
                            onChange={(e) => handleEditInputChange('phone', e.target.value)}
                            size="small"
                            placeholder="電話號碼"
                            sx={{ 
                              ...getValidationStyle(fieldErrors.phone),
                              minWidth: 130,
                              ...commonStyles.animations.slideIn
                            }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ 
                            color: THEME_COLORS.TEXT_SECONDARY 
                          }}>
                            {record.phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...commonStyles.tableCell }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {editingRow === record.id ? (
                          <Select
                            value={editFormData?.status || ''}
                            onChange={(e) => handleEditInputChange('status', e.target.value)}
                            size="small"
                            sx={{ 
                              ...commonStyles.formSelect,
                              minWidth: 100,
                              ...commonStyles.animations.slideIn
                            }}
                          >
                            {statusOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <Chip
                            label={record.status === 'active' ? '進行中' : '已完成'}
                            size="small"
                            sx={{
                              ...getStatusStyle(record.status === 'active' ? 'ongoing' : 'completed'),
                              ...commonStyles.cardLabel
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...commonStyles.tableCell }}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        alignItems: 'center',
                      }}>
                        {editingRow === record.id ? (
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 1,
                            ...commonStyles.animations.slideIn
                          }}>
                            <IconButton 
                              size="small" 
                              onClick={handleSave}
                              sx={{ 
                                color: THEME_COLORS.SUCCESS,
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
                          p: getResponsiveSpacing('lg'), 
                          bgcolor: THEME_COLORS.BACKGROUND_PRIMARY, 
                          borderRadius: 2,
                          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                          ...commonStyles.animations.fadeIn
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ 
                            ...commonStyles.cardTitle,
                            ...commonStyles.spacing.subsection
                          }}>
                          </Typography>
                          
                          {editingRow === record.id ? (
                            // 編輯模式 - 完整表單
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: getResponsiveSpacing('lg') 
                            }}>
                              {/* 第一行：身分證字號和生日 */}
                              <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                gap: getResponsiveSpacing('md')
                              }}>
                                <Box>
                                  <Typography variant="body2" sx={{ ...commonStyles.formLabel }}>
                                    身分證字號
                                  </Typography>
                                  <TextField
                                    value={editFormData?.idNumber || ''}
                                    onChange={(e) => handleEditInputChange('idNumber', e.target.value.toUpperCase())}
                                    size="small"
                                    fullWidth
                                    placeholder="A123456789"
                                    inputProps={{ maxLength: 10 }}
                                    sx={{ ...commonStyles.formInput }}
                                  />
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ ...commonStyles.formLabel }}>
                                    生日
                                  </Typography>
                                  <TextField
                                    type="date"
                                    value={editFormData?.birthDate || ''}
                                    onChange={(e) => handleEditInputChange('birthDate', e.target.value)}
                                    size="small"
                                    fullWidth
                                    sx={{ ...commonStyles.formInput }}
                                  />
                                </Box>
                              </Box>

                              {/* 第二行：城市、地區、詳細地址 */}
                              <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 2fr' },
                                gap: getResponsiveSpacing('md')
                              }}>
                                <Box>
                                  <Typography variant="body2" sx={{ ...commonStyles.formLabel }}>
                                    城市
                                  </Typography>
                                  <Select
                                    value={editFormData?.city || ''}
                                    onChange={(e) => {
                                      handleEditInputChange('city', e.target.value);
                                      // 當城市改變時，重置地區
                                      handleEditInputChange('district', '');
                                    }}
                                    size="small"
                                    fullWidth
                                    sx={{ ...commonStyles.formSelect }}
                                  >
                                    {cityOptions.map((city) => (
                                      <MenuItem key={city} value={city}>{city}</MenuItem>
                                    ))}
                                  </Select>
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ ...commonStyles.formLabel }}>
                                    地區
                                  </Typography>
                                  <Select
                                    value={editFormData?.district || ''}
                                    onChange={(e) => handleEditInputChange('district', e.target.value)}
                                    size="small"
                                    fullWidth
                                    disabled={!editFormData?.city}
                                    sx={{ ...commonStyles.formSelect }}
                                  >
                                    {districtOptions.map((district) => (
                                      <MenuItem key={district} value={district}>{district}</MenuItem>
                                    ))}
                                  </Select>
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ ...commonStyles.formLabel }}>
                                    詳細地址
                                  </Typography>
                                  <TextField
                                    value={editFormData?.address || ''}
                                    onChange={(e) => handleEditInputChange('address', e.target.value)}
                                    size="small"
                                    fullWidth
                                    placeholder="文心路一段315號19樓之2"
                                    sx={{ ...commonStyles.formInput }}
                                  />
                                </Box>
                              </Box>

                              {/* 第三行：個案困難和Email */}
                              <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                gap: getResponsiveSpacing('md')
                              }}>
                                <Box>
                                  <Typography variant="body2" sx={{ ...commonStyles.formLabel }}>
                                    個案的困難
                                  </Typography>
                                  <Select
                                    value={editFormData?.difficulty || ''}
                                    onChange={(e) => handleEditInputChange('difficulty', e.target.value)}
                                    size="small"
                                    fullWidth
                                    sx={{ ...commonStyles.formSelect }}
                                  >
                                    {difficultyOptions.map((difficulty) => (
                                      <MenuItem key={difficulty} value={difficulty}>{difficulty}</MenuItem>
                                    ))}
                                  </Select>
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ ...commonStyles.formLabel }}>
                                    Email
                                  </Typography>
                                  <TextField
                                    type="email"
                                    value={editFormData?.email || ''}
                                    onChange={(e) => handleEditInputChange('email', e.target.value)}
                                    size="small"
                                    fullWidth
                                    placeholder="example@gmail.com"
                                    sx={{ ...getValidationStyle(fieldErrors.email) }}
                                  />
                                </Box>
                              </Box>

                              {/* 編輯按鈕區域 */}
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                gap: 1, 
                                pt: 2,
                                borderTop: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
                              }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={handleCancel}
                                  sx={{ ...commonStyles.secondaryButton }}
                                >
                                  取消
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={handleSave}
                                  sx={{ ...commonStyles.primaryButton }}
                                >
                                  儲存
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            // 顯示模式 - 簡潔文字展示
                            <Box sx={{ 
                              p: 2,
                              color: THEME_COLORS.TEXT_SECONDARY
                            }}>
                              <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
                                gap: 1.5,
                                mb: 1.5
                              }}>
                                {/* 身分證字號 */}
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    color: THEME_COLORS.TEXT_MUTED,
                                    fontSize: '0.8rem'
                                  }}>
                                    身分證字號：
                                  </Typography>
                                  <span style={{ 
                                    filter: showIdRows.includes(record.id) ? 'none' : 'blur(4px)',
                                    transition: 'filter 0.3s ease',
                                    fontFamily: 'monospace',
                                    fontSize: '0.85rem',
                                    color: THEME_COLORS.TEXT_SECONDARY
                                  }}>
                                    {record.idNumber}
                                  </span>
                                  <IconButton
                                    onClick={() => toggleIdVisibility(record.id)}
                                    size="small"
                                    sx={{ 
                                      color: THEME_COLORS.TEXT_MUTED,
                                      width: 18,
                                      height: 18,
                                      ml: 0.5,
                                      '&:hover': {
                                        bgcolor: THEME_COLORS.BACKGROUND_SECONDARY
                                      }
                                    }}
                                  >
                                    {showIdRows.includes(record.id) ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                </Box>

                                {/* 出生日期 */}
                                <Typography variant="body2" sx={{ 
                                  fontSize: '0.85rem'
                                }}>
                                  <span style={{ color: THEME_COLORS.TEXT_MUTED, fontSize: '0.8rem' }}>出生日期：</span>
                                  {record.birthDate}
                                </Typography>

                                {/* Email */}
                                <Typography variant="body2" sx={{ 
                                  fontSize: '0.85rem',
                                  fontFamily: 'monospace'
                                }}>
                                  <span style={{ color: THEME_COLORS.TEXT_MUTED, fontSize: '0.8rem', fontFamily: 'inherit' }}>Email：</span>
                                  {record.email}
                                </Typography>
                              </Box>

                              {/* 地址資訊 */}
                              <Typography variant="body2" sx={{ 
                                fontSize: '0.85rem',
                                mb: 1.5
                              }}>
                                <span style={{ color: THEME_COLORS.TEXT_MUTED, fontSize: '0.8rem' }}>地址：</span>
                                {record.city} {record.district} {record.address}
                              </Typography>

                              {/* 個案困難 */}
                              <Typography variant="body2" sx={{ 
                                fontSize: '0.85rem'
                              }}>
                                <span style={{ color: THEME_COLORS.TEXT_MUTED, fontSize: '0.8rem' }}>困難類型：</span>
                                <Box component="span" sx={{
                                  bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                                  color: THEME_COLORS.TEXT_SECONDARY,
                                  px: 1,
                                  py: 0.3,
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  ml: 0.5
                                }}>
                                  {record.difficulty}
                                </Box>
                              </Typography>
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
          p: getResponsiveSpacing('md'), 
          borderTop: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" sx={{ 
            ...commonStyles.cardLabel,
            color: THEME_COLORS.TEXT_SECONDARY
          }}>
            顯示 1-{caseRecords.length} 筆，共 {caseRecords.length} 筆資料
          </Typography>
          {/* 這裡可以加入分頁組件 */}
        </Box>
      </Paper>
    </Box>
  );
};

export default SearchEditCaseTab; 