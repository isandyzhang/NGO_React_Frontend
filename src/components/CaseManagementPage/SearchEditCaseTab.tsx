import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { 
  Search,
  Edit,
  Save,
  Cancel,
  ExpandMore,
  ExpandLess,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { caseService } from '../../services/caseService';

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
  caseDifficulty: string;
  createdAt: string;
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
  const [caseRecords, setCaseRecords] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入案例資料
  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await caseService.getAllCases();
      setCaseRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入資料時發生錯誤');
      console.error('載入案例資料錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  // 組件載入時取得資料
  useEffect(() => {
    loadCases();
  }, []);

  const handleSearch = async () => {
    if (!searchContent.trim()) {
      loadCases();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await caseService.searchCases({ query: searchContent });
      setCaseRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜尋時發生錯誤');
      console.error('搜尋錯誤:', err);
    } finally {
      setLoading(false);
    }
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
    if (!expandedRows.includes(record.id)) {
      setExpandedRows(prev => [...prev, record.id]);
    }
  };

  const handleSave = async () => {
    if (!editFormData) return;

    const errors: { [key: string]: boolean } = {};
    if (!editFormData.name.trim()) errors.name = true;
    if (!editFormData.phone.trim()) errors.phone = true;
    if (!editFormData.email.trim()) errors.email = true;
    if (!editFormData.idNumber.trim()) errors.idNumber = true;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      
      await caseService.updateCase(editFormData.id, editFormData);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新時發生錯誤');
      console.error('更新錯誤:', err);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  // 選項資料
  const searchTypeOptions = ['姓名', '電話', '地址', '身分證字號', 'Email'];
  const genderOptions = ['男', '女'];
  const cityOptions = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'];
  const districtOptions = [
    '中正區', '大同區', '中山區', '松山區', '大安區', '萬華區',
    '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區',
    '板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區',
    '中區', '東區', '南區', '西區', '北區', '西屯區', '南屯區', '北屯區',
    '前鎮區', '鳳山區', '左營區', '楠梓區', '三民區', '苓雅區'
  ];
  const difficultyOptions = [
    '經濟困難', '家庭問題', '學習困難', '健康問題', '行為問題', 
    '人際關係', '情緒困擾', '其他困難'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* 錯誤訊息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 搜尋區域 */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            {searchTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          
          <TextField
            placeholder={`請輸入${searchType}`}
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: THEME_COLORS.TEXT_SECONDARY }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            sx={{ minWidth: 100, bgcolor: THEME_COLORS.PRIMARY }}
          >
            {loading ? '搜尋中...' : '查詢'}
          </Button>
        </Box>
      </Paper>

      {/* 資料表格 */}
      <TableContainer component={Paper} sx={{ bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: THEME_COLORS.BACKGROUND_SECONDARY }}>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>姓名</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>性別</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>電話</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>城市</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>困難類型</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>建立日期</TableCell>
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY, textAlign: 'center' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && caseRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>載入中...</Typography>
                </TableCell>
              </TableRow>
            ) : caseRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    {searchContent ? '查無符合條件的資料' : '暫無案例資料'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              caseRecords.map((record) => (
                <React.Fragment key={record.id}>
                  {/* 主要資料行 */}
                  <TableRow 
                    hover
                    sx={{ 
                      '&:hover': { backgroundColor: THEME_COLORS.HOVER_LIGHT },
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleRowExpansion(record.id)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={record.avatar} 
                          sx={{ width: 40, height: 40, bgcolor: THEME_COLORS.PRIMARY }}
                        >
                          {record.name.charAt(0)}
                        </Avatar>
                        <Typography sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                          {record.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.gender}
                        size="small"
                        sx={{
                          backgroundColor: record.gender === '男' ? THEME_COLORS.INFO : THEME_COLORS.WARNING,
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                      {record.phone}
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                      {record.city}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.caseDifficulty}
                        size="small"
                        sx={{ backgroundColor: THEME_COLORS.WARNING, color: 'white' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
                      {formatDate(record.createdAt)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(record);
                          }}
                          sx={{ color: THEME_COLORS.PRIMARY }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(record.id);
                          }}
                          sx={{ color: THEME_COLORS.TEXT_SECONDARY }}
                        >
                          {expandedRows.includes(record.id) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* 詳細資料展開行 */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedRows.includes(record.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                          margin: 2, 
                          p: 3, 
                          bgcolor: THEME_COLORS.BACKGROUND_PRIMARY, 
                          borderRadius: 2,
                          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                            詳細資料
                          </Typography>
                          
                          {editingRow === record.id && editFormData ? (
                            // 編輯模式
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                              <TextField
                                label="姓名"
                                value={editFormData.name}
                                onChange={(e) => handleEditInputChange('name', e.target.value)}
                                error={fieldErrors.name}
                                helperText={fieldErrors.name ? '姓名為必填' : ''}
                              />
                              
                              <Select
                                value={editFormData.gender}
                                onChange={(e) => handleEditInputChange('gender', e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="">請選擇性別</MenuItem>
                                {genderOptions.map((option) => (
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                              </Select>

                              <TextField
                                label="出生日期"
                                type="date"
                                value={editFormData.birthDate}
                                onChange={(e) => handleEditInputChange('birthDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                              />

                              <TextField
                                label="身分證字號"
                                value={editFormData.idNumber}
                                onChange={(e) => handleEditInputChange('idNumber', e.target.value)}
                                error={fieldErrors.idNumber}
                                helperText={fieldErrors.idNumber ? '身分證字號為必填' : ''}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => toggleIdVisibility(record.id)}
                                        edge="end"
                                      >
                                        {showIdRows.includes(record.id) ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                type={showIdRows.includes(record.id) ? "text" : "password"}
                              />

                              <TextField
                                label="電話"
                                value={editFormData.phone}
                                onChange={(e) => handleEditInputChange('phone', e.target.value)}
                                error={fieldErrors.phone}
                                helperText={fieldErrors.phone ? '電話為必填' : ''}
                              />

                              <Select
                                value={editFormData.city}
                                onChange={(e) => handleEditInputChange('city', e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="">請選擇城市</MenuItem>
                                {cityOptions.map((option) => (
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                              </Select>

                              <Select
                                value={editFormData.district}
                                onChange={(e) => handleEditInputChange('district', e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="">請選擇地區</MenuItem>
                                {districtOptions.map((option) => (
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                              </Select>

                              <TextField
                                label="地址"
                                value={editFormData.address}
                                onChange={(e) => handleEditInputChange('address', e.target.value)}
                              />

                              <TextField
                                label="Email"
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => handleEditInputChange('email', e.target.value)}
                                error={fieldErrors.email}
                                helperText={fieldErrors.email ? 'Email為必填' : ''}
                              />

                              <Select
                                value={editFormData.caseDifficulty}
                                onChange={(e) => handleEditInputChange('caseDifficulty', e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="">請選擇困難類型</MenuItem>
                                {difficultyOptions.map((option) => (
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                              </Select>

                              {/* 操作按鈕 */}
                              <Box sx={{ display: 'flex', gap: 2, gridColumn: '1 / -1', mt: 2 }}>
                                <Button
                                  variant="contained"
                                  onClick={handleSave}
                                  disabled={loading}
                                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                  sx={{ bgcolor: THEME_COLORS.PRIMARY }}
                                >
                                  {loading ? '儲存中...' : '儲存'}
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={handleCancel}
                                  startIcon={<Cancel />}
                                  sx={{ borderColor: THEME_COLORS.BORDER_DEFAULT }}
                                >
                                  取消
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            // 檢視模式
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">姓名</Typography>
                                <Typography>{record.name}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">性別</Typography>
                                <Typography>{record.gender}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">出生日期</Typography>
                                <Typography>{formatDate(record.birthDate)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">身分證字號</Typography>
                                <Typography>
                                  {showIdRows.includes(record.id) ? record.idNumber : '●●●●●●●●●●'}
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleIdVisibility(record.id)}
                                    sx={{ ml: 1 }}
                                  >
                                    {showIdRows.includes(record.id) ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">電話</Typography>
                                <Typography>{record.phone}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">城市</Typography>
                                <Typography>{record.city}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">地區</Typography>
                                <Typography>{record.district}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">地址</Typography>
                                <Typography>{record.address}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                                <Typography>{record.email}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">困難類型</Typography>
                                <Typography>{record.caseDifficulty}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">建立日期</Typography>
                                <Typography>{formatDate(record.createdAt)}</Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SearchEditCaseTab; 