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
import { caseService, CaseResponse } from '../../services/caseService';
import { formatDate } from '../../utils/dateHelper';

interface CaseRecord {
  caseId: number;
  name: string;
  gender: string;
  birthday?: string;
  identityNumber: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  email: string;
  description: string;
  createdAt: string;
  status: string;
  profileImage?: string;
  detailAddress: string;
  workerName?: string;
}

const SearchEditCaseTab: React.FC = () => {
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
      
      const response = await caseService.searchCases({ query: searchContent });
      setCaseRecords(response.data);
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
    setEditingRow(record.caseId);
    setEditFormData({ ...record });
    setFieldErrors({});
    if (!expandedRows.includes(record.caseId)) {
      setExpandedRows(prev => [...prev, record.caseId]);
    }
  };

  const handleSave = async () => {
    if (!editFormData) return;

    const errors: { [key: string]: boolean } = {};
    if (!editFormData.name.trim()) errors.name = true;
    if (!editFormData.phone.trim()) errors.phone = true;
    if (!editFormData.email.trim()) errors.email = true;
    if (!editFormData.identityNumber.trim()) errors.identityNumber = true;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      
      await caseService.updateCase(editFormData.caseId, editFormData);

      setCaseRecords(prev => 
        prev.map(record => 
          record.caseId === editFormData.caseId 
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



  // 選項資料
  const genderOptions = ['男', '女'];
  const genderMapping = {
    'Male': '男',
    'Female': '女',
    '男': 'Male',
    '女': 'Female'
  };
  const cityOptions = [
    '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
    '基隆市', '新竹市', '嘉義市', '宜蘭縣', '新竹縣', '苗栗縣',
    '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '台東縣',
    '花蓮縣', '澎湖縣', '金門縣', '連江縣'
  ];
  const districtOptions: { [key: string]: string[] } = {
    '台北市': ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
    '新北市': ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '樹林區', '鶯歌區', '三峽區', '淡水區', '汐止區', '瑞芳區', '土城區', '蘆洲區', '五股區', '泰山區', '林口區', '深坑區', '石碇區', '坪林區', '三芝區', '石門區', '八里區', '平溪區', '雙溪區', '貢寮區', '金山區', '萬里區', '烏來區'],
    '桃園市': ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '大園區', '龜山區', '龍潭區', '新屋區', '觀音區', '復興區'],
    '台中市': ['中區', '東區', '南區', '西區', '北區', '西屯區', '南屯區', '北屯區', '豐原區', '東勢區', '大甲區', '清水區', '沙鹿區', '梧棲區', '后里區', '神岡區', '潭子區', '大雅區', '新社區', '石岡區', '外埔區', '大安區', '烏日區', '大肚區', '龍井區', '霧峰區', '太平區', '大里區', '和平區'],
    '台南市': ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'],
    '高雄市': ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區'],
    '基隆市': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
    '新竹市': ['東區', '北區', '香山區'],
    '嘉義市': ['東區', '西區'],
    '宜蘭縣': ['宜蘭市', '羅東鎮', '蘇澳鎮', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '冬山鄉', '五結鄉', '三星鄉', '大同鄉', '南澳鄉'],
    '新竹縣': ['竹北市', '竹東鎮', '新埔鎮', '關西鎮', '湖口鄉', '新豐鄉', '芎林鄉', '橫山鄉', '北埔鄉', '寶山鄉', '峨眉鄉', '尖石鄉', '五峰鄉'],
    '苗栗縣': ['苗栗市', '苑裡鎮', '通霄鎮', '竹南鎮', '頭份市', '後龍鎮', '卓蘭鎮', '大湖鄉', '公館鄉', '銅鑼鄉', '南庄鄉', '頭屋鄉', '三義鄉', '西湖鄉', '造橋鄉', '三灣鄉', '獅潭鄉', '泰安鄉'],
    '彰化縣': ['彰化市', '員林市', '和美鎮', '鹿港鎮', '溪湖鎮', '二林鎮', '田中鎮', '北斗鎮', '花壇鄉', '芬園鄉', '大村鄉', '永靖鄉', '伸港鄉', '線西鄉', '福興鄉', '秀水鄉', '埔鹽鄉', '埔心鄉', '大城鄉', '芳苑鄉', '竹塘鄉', '溪州鄉'],
    '南投縣': ['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮', '名間鄉', '鹿谷鄉', '中寮鄉', '魚池鄉', '國姓鄉', '水里鄉', '信義鄉', '仁愛鄉'],
    '雲林縣': ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮', '古坑鄉', '大埤鄉', '莿桐鄉', '林內鄉', '二崙鄉', '崙背鄉', '麥寮鄉', '東勢鄉', '褒忠鄉', '台西鄉', '元長鄉', '四湖鄉', '口湖鄉', '水林鄉'],
    '嘉義縣': ['太保市', '朴子市', '布袋鎮', '大林鎮', '民雄鄉', '溪口鄉', '新港鄉', '六腳鄉', '東石鄉', '義竹鄉', '鹿草鄉', '水上鄉', '中埔鄉', '竹崎鄉', '梅山鄉', '番路鄉', '大埔鄉', '阿里山鄉'],
    '屏東縣': ['屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉', '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉', '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉', '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉', '枋山鄉', '三地門鄉', '霧台鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉', '牡丹鄉'],
    '台東縣': ['台東市', '成功鎮', '關山鎮', '卑南鄉', '鹿野鄉', '池上鄉', '東河鄉', '長濱鄉', '太麻里鄉', '大武鄉', '綠島鄉', '海端鄉', '延平鄉', '金峰鄉', '達仁鄉', '蘭嶼鄉'],
    '花蓮縣': ['花蓮市', '鳳林鎮', '玉里鎮', '新城鄉', '吉安鄉', '壽豐鄉', '光復鄉', '豐濱鄉', '瑞穗鄉', '富里鄉', '秀林鄉', '萬榮鄉', '卓溪鄉'],
    '澎湖縣': ['馬公市', '西嶼鄉', '望安鄉', '七美鄉', '白沙鄉', '湖西鄉'],
    '金門縣': ['金城鎮', '金沙鎮', '金湖鎮', '金寧鄉', '烈嶼鄉', '烏坵鄉'],
    '連江縣': ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉']
  };
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
          <TextField
            placeholder={`請輸入關鍵字`}
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
                <React.Fragment key={record.caseId}>
                  {/* 主要資料行 */}
                  <TableRow 
                    hover
                    sx={{ 
                      '&:hover': { backgroundColor: THEME_COLORS.HOVER_LIGHT },
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleRowExpansion(record.caseId)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={record.profileImage || undefined} 
                          sx={{ width: 40, height: 40, bgcolor: THEME_COLORS.PRIMARY }}
                        >
                          {!record.profileImage && record.name.charAt(0)}
                        </Avatar>
                        <Typography sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                          {record.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={genderMapping[record.gender as keyof typeof genderMapping] || record.gender}
                        size="small"
                        sx={{
                          backgroundColor: record.gender === 'Male' ? THEME_COLORS.MALE_AVATAR : THEME_COLORS.FEMALE_AVATAR,
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
                        label={record.description}
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
                            toggleRowExpansion(record.caseId);
                          }}
                          sx={{ color: THEME_COLORS.TEXT_SECONDARY }}
                        >
                          {expandedRows.includes(record.caseId) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* 詳細資料展開行 */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedRows.includes(record.caseId)} timeout="auto" unmountOnExit>
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
                          
                          {editingRow === record.caseId && editFormData ? (
                            // 編輯模式
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                              <TextField
                                label="姓名"
                                value={editFormData.name}
                                onChange={(e) => handleEditInputChange('name', e.target.value)}
                                error={fieldErrors.name}
                                helperText={fieldErrors.name ? '姓名為必填' : ''}
                              />
                              
                              <TextField
                                select
                                label="性別"
                                value={genderMapping[editFormData.gender as keyof typeof genderMapping] || editFormData.gender}
                                onChange={(e) => handleEditInputChange('gender', genderMapping[e.target.value as keyof typeof genderMapping] || e.target.value)}
                                InputLabelProps={{ shrink: true }}
                              >
                                <MenuItem value="">請選擇性別</MenuItem>
                                {genderOptions.map((option) => (
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                              </TextField>

                              <TextField
                                label="出生日期"
                                type="date"
                                value={editFormData.birthday ? (editFormData.birthday.length > 10 ? editFormData.birthday.substring(0, 10) : editFormData.birthday) : ''}
                                onChange={(e) => handleEditInputChange('birthday', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                              />

                              <TextField
                                label="身分證字號"
                                value={editFormData.identityNumber}
                                onChange={(e) => handleEditInputChange('identityNumber', e.target.value)}
                                error={fieldErrors.identityNumber}
                                helperText={fieldErrors.identityNumber ? '身分證字號為必填' : ''}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => toggleIdVisibility(record.caseId)}
                                        edge="end"
                                      >
                                        {showIdRows.includes(record.caseId) ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                type={showIdRows.includes(record.caseId) ? "text" : "password"}
                              />

                              <TextField
                                label="電話"
                                value={editFormData.phone}
                                onChange={(e) => handleEditInputChange('phone', e.target.value)}
                                error={fieldErrors.phone}
                                helperText={fieldErrors.phone ? '電話為必填' : ''}
                              />

                              <TextField
                                select
                                label="城市"
                                value={editFormData.city}
                                onChange={(e) => handleEditInputChange('city', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                              >
                                <MenuItem value="">請選擇城市</MenuItem>
                                {cityOptions.map((option) => (
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                              </TextField>

                              <TextField
                                select
                                label="地區"
                                value={editFormData.district}
                                onChange={(e) => handleEditInputChange('district', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                disabled={!editFormData.city}
                              >
                                <MenuItem value="">請選擇地區</MenuItem>
                                {(districtOptions[editFormData.city] ? districtOptions[editFormData.city] : []).map((option: string) => (
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                              </TextField>

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

                              <TextField
                                select
                                label="困難類型"
                                value={editFormData.description}
                                onChange={(e) => handleEditInputChange('description', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                              >
                                <MenuItem value="">請選擇困難類型</MenuItem>
                                {difficultyOptions.map((option) => (
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                              </TextField>

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
                                <Typography>{genderMapping[record.gender as keyof typeof genderMapping] || record.gender}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">出生日期</Typography>
                                <Typography>{record.birthday ? formatDate(record.birthday) : '未設定'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">身分證字號</Typography>
                                <Typography>
                                  {showIdRows.includes(record.caseId) ? record.identityNumber : '●●●●●●●●●●'}
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleIdVisibility(record.caseId)}
                                    sx={{ ml: 1 }}
                                  >
                                    {showIdRows.includes(record.caseId) ? <VisibilityOff /> : <Visibility />}
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
                                <Typography>{record.description}</Typography>
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