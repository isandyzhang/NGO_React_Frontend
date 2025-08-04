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
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Slider,
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
  Delete,
  PlayArrow,
  Pause,
  VolumeUp,
  PhotoCamera,
  Visibility as VisibilityIcon,
  ErrorOutline,
  Audiotrack,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { caseService, CaseResponse } from '../../services/caseManagement/caseService';
import { authService } from '../../services/accountManagement/authService';
import { formatDate } from '../../utils/dateHelper';
import { caseSpeechService } from '../../services/caseManagement/caseSpeechService';

// 基本資訊介面 - 用於列表顯示
interface CaseBasicInfo {
  caseId: number;
  name: string;
  gender: string;
  birthday?: string;
  phone: string;
  city: string;
  description: string;
  createdAt: string;
  status: string;
  profileImage?: string;
}

// 詳細資訊介面 - 展開時載入
interface CaseDetailInfo {
  identityNumber: string;
  district: string;
  email: string;
  detailAddress: string;
  workerName?: string;
  speechToTextAudioUrl?: string;
}

// 完整個案記錄
interface CaseRecord extends CaseBasicInfo {
  details?: CaseDetailInfo; // 詳細資訊可選，用於 lazy loading
  detailsLoaded?: boolean; // 標記詳細資訊是否已載入
  detailsLoading?: boolean; // 標記詳細資訊載入中
}

const SearchEditCaseTab: React.FC = () => {
  const [searchContent, setSearchContent] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  // 編輯表單資料類型 - 包含完整資訊
  interface EditFormData extends CaseBasicInfo {
    identityNumber: string;
    email: string;
    district: string;
    detailAddress: string;  // 街道地址，如：文心路一段216號
    workerName?: string;
    speechToTextAudioUrl?: string;
    imageFile?: File;  // 暫存的圖片檔案
    audioFile?: File;  // 暫存的音檔檔案
  }
  
  // 🔧 修正：為每個個案維護獨立的編輯資料
  const [editFormDataMap, setEditFormDataMap] = useState<Map<number, EditFormData>>(new Map());
  const [showIdRows, setShowIdRows] = useState<number[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [caseRecords, setCaseRecords] = useState<CaseRecord[]>([]);
  const [detailsCache, setDetailsCache] = useState<Map<number, CaseDetailInfo>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 分頁相關狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 刪除確認對話框狀態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState<CaseRecord | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // 錯誤提示對話框狀態
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  // 音檔播放相關狀態
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingCaseId, setCurrentPlayingCaseId] = useState<number | null>(null);
  const [volume, setVolume] = useState(1); // 音量控制 (0-1)
  const [transcriptionText, setTranscriptionText] = useState<string>(''); // 語音轉字幕文字
  const [isTranscribing, setIsTranscribing] = useState(false); // 轉字幕中狀態
  const [currentTime, setCurrentTime] = useState(0); // 當前播放時間
  const [duration, setDuration] = useState(0); // 音檔總時長
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖拽時間軸

  // 圖片上傳相關狀態
  const [imageUploadLoading, setImageUploadLoading] = useState<number | null>(null);
  const [imagePreviewMap, setImagePreviewMap] = useState<Map<number, string>>(new Map());

  // 音檔上傳相關狀態
  const [audioUploadLoading, setAudioUploadLoading] = useState<number | null>(null);
  const [audioPreviewMap, setAudioPreviewMap] = useState<Map<number, string>>(new Map());

  // 🚀 Lazy Loading: 載入個案詳細資料
  const loadCaseDetails = async (caseId: number): Promise<CaseDetailInfo | null> => {
    // 先檢查快取
    const cachedDetails = detailsCache.get(caseId);
    if (cachedDetails) {
      console.log(`✅ 從快取載入個案 ${caseId} 詳細資料`);
      return cachedDetails;
    }

    try {
      console.log(`🔄 從 API 載入個案 ${caseId} 詳細資料`);
      
      // 標記載入中
      setCaseRecords(prev => 
        prev.map(record => 
          record.caseId === caseId 
            ? { ...record, detailsLoading: true }
            : record
        )
      );

      const response = await caseService.getCaseById(caseId);
      
      const details: CaseDetailInfo = {
        identityNumber: response.identityNumber,
        district: response.district,
        email: response.email,
        detailAddress: response.detailAddress,
        workerName: response.workerName,
        speechToTextAudioUrl: response.speechToTextAudioUrl
      };

      // 更新快取
      const newCache = new Map(detailsCache);
      newCache.set(caseId, details);
      setDetailsCache(newCache);

      // 更新記錄狀態
      setCaseRecords(prev => 
        prev.map(record => 
          record.caseId === caseId 
            ? { 
                ...record, 
                details, 
                detailsLoaded: true, 
                detailsLoading: false 
              }
            : record
        )
      );

      console.log(`✅ 成功載入個案 ${caseId} 詳細資料`);
      return details;
    } catch (error) {
      console.error(`❌ 載入個案 ${caseId} 詳細資料失敗:`, error);
      
      // 標記載入失敗
      setCaseRecords(prev => 
        prev.map(record => 
          record.caseId === caseId 
            ? { ...record, detailsLoading: false }
            : record
        )
      );
      
      return null;
    }
  };



  // 載入案例資料
  const loadCases = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // 獲取當前用戶資訊
      const currentWorker = authService.getCurrentWorker();
      if (!currentWorker) {
        setError('未找到登入工作人員資訊，請重新登入');
        return;
      }
      
      const workerId = currentWorker.workerId;
      const userRole = currentWorker.role;
      
      console.log('開始載入案例資料，頁碼:', page, '用戶:', currentWorker.name, '角色:', userRole);
      
      // 根據角色決定是否過濾WorkerId
      let response;
      if (userRole === 'supervisor' || userRole === 'admin') {
        // 主管和管理員可以看到所有個案
        response = await caseService.getAllCases(page, pageSize);
      } else {
        // 一般員工只能看到自己負責的個案
        response = await caseService.getAllCases(page, pageSize, workerId);
      }
      console.log('API 回應:', response);
      
      // 🚀 Lazy Loading: 只載入基本資訊
      // 檢查 response 是否為陣列或包含 data 屬性
      const apiData = Array.isArray(response) ? response : response.data;
      if (!apiData || !Array.isArray(apiData)) {
        console.error('API 回應格式錯誤:', response);
        setCaseRecords([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      
      const transformedData: CaseRecord[] = apiData.map(item => ({
        // 基本資訊 - 立即載入
        caseId: item.caseId,
        name: item.name,
        gender: item.gender,
        birthday: item.birthday,
        phone: item.phone,
        city: item.city,
        description: item.description,
        createdAt: item.createdAt,
        status: item.status,
        profileImage: item.profileImage,
        // Lazy loading 相關標記
        detailsLoaded: false,
        detailsLoading: false
      }));
      
      // 同時將詳細資訊存入快取，避免重複載入
      const newDetailsCache = new Map(detailsCache);
      apiData.forEach(item => {
        newDetailsCache.set(item.caseId, {
          identityNumber: item.identityNumber,
          district: item.district,
          email: item.email,
          detailAddress: item.detailAddress,
          workerName: item.workerName,
          speechToTextAudioUrl: item.speechToTextAudioUrl
        });
      });
      setDetailsCache(newDetailsCache);
      
      console.log('🎵 音檔檢查:', apiData.map(item => ({ 
        caseId: item.caseId, 
        name: item.name, 
        speechToTextAudioUrl: item.speechToTextAudioUrl 
      })));
      
      setCaseRecords(transformedData);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入資料時發生錯誤');
      console.error('載入案例資料錯誤:', err);
      setCaseRecords([]);
      setTotalCount(0);
      setTotalPages(1);
      setCurrentPage(1);
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
      loadCases(1);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 獲取當前用戶資訊
      const currentWorker = authService.getCurrentWorker();
      if (!currentWorker) {
        setError('未找到登入工作人員資訊，請重新登入');
        return;
      }
      
      const workerId = currentWorker.workerId;
      const userRole = currentWorker.role;
      
      // 根據角色決定搜尋參數
      const searchParams: any = { 
        query: searchContent, 
        page: 1, 
        pageSize 
      };
      
      if (userRole !== 'supervisor' && userRole !== 'admin') {
        // 一般員工只能搜尋自己負責的個案
        searchParams.workerId = workerId;
      }
      
      const response = await caseService.searchCases(searchParams);
      console.log('🔍 完整搜尋回應:', response);
      console.log('🔍 回應中的 data:', response.data);
      console.log('🔍 回應中的 total:', response.total);
      
      // 🚀 Lazy Loading: 搜尋結果只載入基本資訊
      // 檢查搜尋回應格式
      const searchData = Array.isArray(response.data) ? response.data : [];
      console.log('🔍 處理後的 searchData:', searchData);
      const transformedData: CaseRecord[] = searchData.map(item => ({
        // 基本資訊 - 立即載入
        caseId: item.caseId,
        name: item.name,
        gender: item.gender,
        birthday: item.birthday,
        phone: item.phone,
        city: item.city,
        description: item.description,
        createdAt: item.createdAt,
        status: item.status,
        profileImage: item.profileImage,
        // Lazy loading 相關標記
        detailsLoaded: false,
        detailsLoading: false
      }));
      
      // 同時將詳細資訊存入快取
      const newDetailsCache = new Map(detailsCache);
      searchData.forEach(item => {
        newDetailsCache.set(item.caseId, {
          identityNumber: item.identityNumber,
          district: item.district,
          email: item.email,
          detailAddress: item.detailAddress,
          workerName: item.workerName,
          speechToTextAudioUrl: item.speechToTextAudioUrl
        });
      });
      setDetailsCache(newDetailsCache);
      
      setCaseRecords(transformedData);
      setTotalCount(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜尋時發生錯誤');
      console.error('搜尋錯誤:', err);
      setCaseRecords([]);
      setTotalCount(0);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  // 處理分頁變更
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    // 阻止默認行為，避免頁面重整
    event.preventDefault();
    
    if (searchContent.trim()) {
      // 如果有搜尋內容，執行搜尋分頁
      handleSearchPage(page);
    } else {
      // 否則載入一般分頁
      loadCases(page);
    }
  };

  // 搜尋分頁
  const handleSearchPage = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // 獲取當前用戶資訊
      const currentWorker = authService.getCurrentWorker();
      if (!currentWorker) {
        setError('未找到登入工作人員資訊，請重新登入');
        return;
      }
      
      const workerId = currentWorker.workerId;
      const userRole = currentWorker.role;
      
      console.log('開始搜尋分頁，關鍵字:', searchContent, '頁碼:', page);
      
      // 根據角色決定搜尋參數
      const searchParams: any = { 
        query: searchContent, 
        page, 
        pageSize 
      };
      
      if (userRole !== 'supervisor' && userRole !== 'admin') {
        // 一般員工只能搜尋自己負責的個案
        searchParams.workerId = workerId;
      }
      
      const response = await caseService.searchCases(searchParams);
      console.log('🔍 完整搜尋回應:', response);
      console.log('🔍 回應中的 data:', response.data);
      console.log('🔍 回應中的 total:', response.total);
      
      // 🚀 Lazy Loading: 搜尋結果只載入基本資訊
      // 檢查搜尋回應格式
      const searchData = Array.isArray(response.data) ? response.data : [];
      console.log('🔍 處理後的 searchData:', searchData);
      const transformedData: CaseRecord[] = searchData.map(item => ({
        // 基本資訊 - 立即載入
        caseId: item.caseId,
        name: item.name,
        gender: item.gender,
        birthday: item.birthday,
        phone: item.phone,
        city: item.city,
        description: item.description,
        createdAt: item.createdAt,
        status: item.status,
        profileImage: item.profileImage,
        // Lazy loading 相關標記
        detailsLoaded: false,
        detailsLoading: false
      }));
      
      // 同時將詳細資訊存入快取
      const newDetailsCache = new Map(detailsCache);
      searchData.forEach(item => {
        newDetailsCache.set(item.caseId, {
          identityNumber: item.identityNumber,
          district: item.district,
          email: item.email,
          detailAddress: item.detailAddress,
          workerName: item.workerName,
          speechToTextAudioUrl: item.speechToTextAudioUrl
        });
      });
      setDetailsCache(newDetailsCache);
      
      setCaseRecords(transformedData);
      setTotalCount(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜尋分頁時發生錯誤');
      console.error('搜尋分頁錯誤:', err);
      setCaseRecords([]);
      setTotalCount(0);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = async (id: number) => {
    if (expandedRows.includes(id)) {
      // 關閉下拉選單時，如果正在播放音檔，則暫停播放
      if (currentPlayingCaseId === id && isPlaying && audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        setIsPlaying(false);
        setCurrentPlayingCaseId(null);
        setAudioPlayer(null);
      }
      
      setExpandedRows(prev => prev.filter(rowId => rowId !== id));
      if (editingRow === id) {
        setEditingRow(null);
        // 清除該個案的編輯資料
        setEditFormDataMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
      }
    } else {
      setExpandedRows(prev => [...prev, id]);
      
      // 🚀 Lazy Loading: 展開時載入詳細資料
      const record = caseRecords.find(r => r.caseId === id);
      if (record) {
        // 檢查是否已載入詳細資料
        if (!record.detailsLoaded && !record.detailsLoading) {
          await loadCaseDetails(id);
        }
        
        // 獲取最新的記錄（可能已經更新）
        const updatedRecord = caseRecords.find(r => r.caseId === id);
        if (updatedRecord) {
          // 建立編輯表單資料，合併基本資訊和詳細資訊
          const cachedDetails = detailsCache.get(id);
          const formData: EditFormData = {
            // 基本資訊
            caseId: updatedRecord.caseId,
            name: updatedRecord.name,
            gender: updatedRecord.gender,
            birthday: updatedRecord.birthday,
            phone: updatedRecord.phone,
            city: updatedRecord.city,
            description: updatedRecord.description,
            createdAt: updatedRecord.createdAt,
            status: updatedRecord.status,
            profileImage: updatedRecord.profileImage,
            // 詳細資訊 - 從快取或詳細資訊中獲取
            identityNumber: updatedRecord.details?.identityNumber || cachedDetails?.identityNumber || '',
            email: updatedRecord.details?.email || cachedDetails?.email || '',
            district: updatedRecord.details?.district || cachedDetails?.district || '',
            detailAddress: updatedRecord.details?.detailAddress || cachedDetails?.detailAddress || '',
            workerName: updatedRecord.details?.workerName || cachedDetails?.workerName || '',
            speechToTextAudioUrl: updatedRecord.details?.speechToTextAudioUrl || cachedDetails?.speechToTextAudioUrl || ''
          };
          
          setEditingRow(id);
          // 將編輯資料存入對應的個案 Map 中
          setEditFormDataMap(prev => {
            const newMap = new Map(prev);
            newMap.set(id, formData);
            return newMap;
          });
          setFieldErrors({});
        }
      }
    }
  };

  // 這個函數已經不需要，因為展開邏輯已整合到 toggleRowExpansion 中
  // const handleEdit = (record: CaseRecord) => {
  //   // 已棄用 - 使用 toggleRowExpansion 代替
  // };

  const handleSave = async () => {
    if (!editingRow) return;
    const editFormData = editFormDataMap.get(editingRow);
    if (!editFormData) return;

    const errors: { [key: string]: boolean } = {};
    if (!editFormData.name.trim()) errors.name = true;
    if (!editFormData.phone.trim()) errors.phone = true;
    if (!editFormData.email.trim()) errors.email = true;
    if (!editFormData.identityNumber.trim()) errors.identityNumber = true;
    
    // 驗證身分證字號格式
    if (editFormData.identityNumber.trim()) {
      const idNumber = editFormData.identityNumber.trim();
      if (idNumber.length !== 10) {
        errors.identityNumber = true;
        setErrorMessage('身分證字號必須為10位數字');
        setErrorDetails([]);
        setErrorDialogOpen(true);
        return;
      }
      if (!/^[A-Z][0-9]{9}$/.test(idNumber)) {
        errors.identityNumber = true;
        setErrorMessage('身分證字號格式錯誤：應為1個英文字母後接9個數字');
        setErrorDetails([]);
        setErrorDialogOpen(true);
        return;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      
      // 轉換為更新格式，只包含有變更的字段
      const updateData: {
        Name?: string;
        Phone?: string;
        Email?: string;
        IdentityNumber?: string;
        Gender?: string;
        City?: string;
        District?: string;
        DetailAddress?: string;
        Description?: string;
        Birthday?: Date;
        ProfileImage?: string;
      } = {
        Name: editFormData.name,
        Phone: editFormData.phone,
        Email: editFormData.email,
        IdentityNumber: editFormData.identityNumber,
        Gender: editFormData.gender, // 確保傳送的是 Male/Female 格式
        City: editFormData.city,
        District: editFormData.district,
        DetailAddress: editFormData.detailAddress,
        Description: editFormData.description,
        Birthday: editFormData.birthday ? new Date(editFormData.birthday + 'T00:00:00') : undefined,
      };

      // 只有當 ProfileImage 是有效的 URL 時才包含在更新數據中
      if (editFormData.profileImage && editFormData.profileImage.trim() !== '') {
        try {
          new URL(editFormData.profileImage);
          updateData.ProfileImage = editFormData.profileImage;
        } catch (error) {
          console.warn('⚠️ ProfileImage 不是有效的 URL，將被忽略:', editFormData.profileImage);
        }
      }
      
      // 調試信息
      console.log('🔍 準備更新的資料:', {
        caseId: editFormData.caseId,
        updateData,
        identityNumber: editFormData.identityNumber,
        identityNumberLength: editFormData.identityNumber?.length,
        gender: editFormData.gender,
        birthday: editFormData.birthday,
        birthdayAsDate: updateData.Birthday
      });
      
      // 如果有新的圖片檔案，先上傳圖片
      if (editFormData.imageFile) {
        console.log('🖼️ 開始上傳新圖片...');
        const formData = new FormData();
        formData.append('file', editFormData.imageFile);
        
        const response = await caseService.uploadProfileImage(formData);
        
        // 處理不同的回應格式
        let imageUrl = '';
        if (response) {
          if (typeof response === 'string') {
            imageUrl = response;
          } else if (typeof response === 'object') {
            if ('imageUrl' in response && response.imageUrl) {
              imageUrl = response.imageUrl;
            } else if ('data' in response && typeof response.data === 'string') {
              imageUrl = response.data;
            }
          }
        }
        
        if (imageUrl) {
          // 更新個案的圖片 URL
          const imageUpdateData = { ProfileImage: imageUrl };
          await caseService.updateCase(editFormData.caseId, imageUpdateData);
          console.log('✅ 圖片上傳並更新成功');
        } else {
          throw new Error('圖片上傳失敗：無法獲取圖片URL');
        }
      }

      // 如果有新的音檔檔案，先上傳音檔
      console.log('🎵 檢查是否有音檔需要上傳:', { 
        hasAudioFile: !!editFormData.audioFile,
        audioFileName: editFormData.audioFile?.name,
        caseId: editFormData.caseId
      });
      
      if (editFormData.audioFile) {
        console.log('🎵 開始上傳新音檔...', {
          fileName: editFormData.audioFile.name,
          fileSize: editFormData.audioFile.size,
          fileType: editFormData.audioFile.type,
          caseId: editFormData.caseId
        });
        
        try {
          // 使用 caseSpeechService 上傳音檔並自動關聯到個案
          const response = await caseService.uploadAudioFile(editFormData.audioFile, editFormData.caseId);
          
          console.log('✅ 音檔上傳成功，後端已自動更新個案音檔URL:', response);
        } catch (audioError) {
          console.error('❌ 音檔上傳失敗:', audioError);
          throw new Error(`音檔上傳失敗: ${audioError.message}`);
        }
      } else {
        console.log('ℹ️ 沒有音檔需要上傳');
      }

      // 更新其他資料
      await caseService.updateCase(editFormData.caseId, updateData);

      // 重新載入當前頁面的數據，確保顯示最新資料
      console.log('🔄 更新成功，重新載入數據...');
      await loadCases(currentPage);
      
      // 收起編輯的 row
      setExpandedRows(prev => prev.filter(rowId => rowId !== editFormData.caseId));
      
      setEditingRow(null);
      // 清除該個案的編輯資料
      setEditFormDataMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(editFormData.caseId);
        return newMap;
      });
      
      // 清除預覽圖片
      setImagePreviewMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(editFormData.caseId);
        return newMap;
      });

      // 清除預覽音檔
      setAudioPreviewMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(editFormData.caseId);
        return newMap;
      });
      
      setFieldErrors({});
      
      // 顯示成功訊息
      setSubmitMessage({
        type: 'success',
        text: '個案資料已成功更新！'
      });
      
      // 3秒後清除成功訊息
      setTimeout(() => {
        setSubmitMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('更新錯誤:', err);
      
      // 處理後端回傳的詳細錯誤訊息
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.message) {
          setErrorMessage(errorData.message);
          setErrorDetails([]);
          setErrorDialogOpen(true);
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          setErrorMessage(errorData.errors.join(', '));
          setErrorDetails([]);
          setErrorDialogOpen(true);
        } else {
          setErrorMessage('更新失敗，請檢查輸入資料');
          setErrorDetails([]);
          setErrorDialogOpen(true);
        }
      } else if (err.message) {
        setErrorMessage(err.message);
        setErrorDetails([]);
        setErrorDialogOpen(true);
      } else {
        setErrorMessage('更新時發生錯誤');
        setErrorDetails([]);
        setErrorDialogOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (editingRow) {
      // 清除該個案的編輯資料
      setEditFormDataMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(editingRow);
        return newMap;
      });
      
      // 清除預覽圖片
      setImagePreviewMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(editingRow);
        return newMap;
      });

      // 清除預覽音檔
      setAudioPreviewMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(editingRow);
        return newMap;
      });
    }
    setEditingRow(null);
    setFieldErrors({});
  };

  const handleEditInputChange = (field: string, value: any) => {
    if (editingRow) {
      setEditFormDataMap(prev => {
        const newMap = new Map(prev);
        const currentData = newMap.get(editingRow);
        if (currentData) {
          newMap.set(editingRow, { ...currentData, [field]: value });
        }
        return newMap;
      });
    }
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

  // 刪除相關處理函數
  const handleDeleteClick = (record: CaseRecord) => {
    setDeleteRecord(record);
    setDeleteConfirmName('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRecord || deleteConfirmName !== deleteRecord.name) {
      return;
    }

    try {
      setDeleteLoading(true);
      await caseService.deleteCase(deleteRecord.caseId);
      
      // 重新載入資料
      await loadCases(currentPage);
      
      // 收起被刪除的 row（如果它之前是展開的）
      if (deleteRecord) {
        setExpandedRows(prev => prev.filter(rowId => rowId !== deleteRecord.caseId));
      }
      
      // 重置狀態
      setDeleteDialogOpen(false);
      setDeleteRecord(null);
      setDeleteConfirmName('');
      
      // 顯示成功訊息
      setSubmitMessage({
        type: 'success',
        text: '個案已成功刪除！'
      });
      
      // 3秒後清除成功訊息
      setTimeout(() => {
        setSubmitMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('刪除錯誤:', err);
      
      // 處理後端回傳的詳細錯誤訊息
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.details) {
          // 顯示詳細的錯誤訊息，包含相關資料列表
          setErrorMessage(errorData.message || '無法刪除個案');
          setErrorDetails(errorData.relatedData || []);
          setErrorDialogOpen(true);
        } else if (errorData.message) {
          setErrorMessage(errorData.message);
          setErrorDetails([]);
          setErrorDialogOpen(true);
        } else {
          setErrorMessage('刪除失敗，請稍後再試');
          setErrorDetails([]);
          setErrorDialogOpen(true);
        }
      } else if (err.message) {
        setErrorMessage(err.message);
        setErrorDetails([]);
        setErrorDialogOpen(true);
      } else {
        setErrorMessage('刪除失敗，請稍後再試');
        setErrorDetails([]);
        setErrorDialogOpen(true);
      }
      
      setErrorMessage(err instanceof Error ? err.message : '刪除時發生錯誤');
      setErrorDetails([]);
      setErrorDialogOpen(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteRecord(null);
    setDeleteConfirmName('');
  };

  // 檢查使用者權限
  const getCurrentUserRole = () => {
    const currentWorker = authService.getCurrentWorker();
    return currentWorker?.role || '';
  };

  const canDeleteCase = () => {
    const role = getCurrentUserRole();
    return role === 'admin' || role === 'supervisor';
  };

  // 計算年齡函數
  const calculateAge = (birthday?: string) => {
    if (!birthday) return '未知';
    
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  // 困難類型顏色映射函數
  const getDifficultyColor = (difficulty: string) => {
    const colorMap: { [key: string]: string } = {
      '經濟困難': THEME_COLORS.ERROR,        // 紅色 - 緊急
      '家庭問題': THEME_COLORS.WARNING,      // 橙色 - 警告
      '學習困難': THEME_COLORS.INFO,         // 藍色 - 資訊
      '健康問題': THEME_COLORS.ERROR_DARK,   // 深紅色 - 嚴重
      '行為問題': '#9c27b0',                 // 紫色 - 行為相關
      '人際關係': '#00bcd4',                 // 青色 - 社交相關
      '情緒困擾': '#ff5722',                 // 深橙色 - 情緒相關
      '其他困難': THEME_COLORS.TEXT_MUTED    // 灰色 - 其他
    };
    return colorMap[difficulty] || THEME_COLORS.PRIMARY;
  };

  // 音檔播放功能
  const handlePlayAudio = (audioUrl: string, caseId: number) => {
    if (currentPlayingCaseId === caseId && isPlaying) {
      // 停止播放
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentPlayingCaseId(null);
      setAudioPlayer(null);
      setCurrentTime(0);
      setDuration(0);
    } else {
      // 開始播放
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeEventListener('timeupdate', () => {});
        audioPlayer.removeEventListener('loadedmetadata', () => {});
      }
      
      const newAudioPlayer = new Audio(audioUrl);
      
      // 設定音量
      newAudioPlayer.volume = volume;
      
      // 時間更新事件
      const updateTime = () => {
        if (!isDragging) {
          setCurrentTime(newAudioPlayer.currentTime);
        }
      };
      
      // 載入元數據事件（獲取總時長）
      const updateDuration = () => {
        setDuration(newAudioPlayer.duration);
      };
      
      newAudioPlayer.addEventListener('timeupdate', updateTime);
      newAudioPlayer.addEventListener('loadedmetadata', updateDuration);
      
      newAudioPlayer.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentPlayingCaseId(null);
        setAudioPlayer(null);
        setCurrentTime(0);
        setDuration(0);
      });
      
      newAudioPlayer.addEventListener('error', () => {
        console.error('音檔播放失敗:', audioUrl);
        setIsPlaying(false);
        setCurrentPlayingCaseId(null);
        setAudioPlayer(null);
        setCurrentTime(0);
        setDuration(0);
      });
      
      newAudioPlayer.play().then(() => {
        setIsPlaying(true);
        setCurrentPlayingCaseId(caseId);
        setAudioPlayer(newAudioPlayer);
      }).catch((error) => {
        console.error('音檔播放失敗:', error);
        setIsPlaying(false);
        setCurrentPlayingCaseId(null);
        setAudioPlayer(null);
        setCurrentTime(0);
        setDuration(0);
      });
    }
  };

  // 音量控制
  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    
    // 如果正在播放，立即更新音量
    if (audioPlayer) {
      audioPlayer.volume = newVolume;
    }
  };

  // 時間軸控制
  const handleTimelineChange = (event: Event, newValue: number | number[]) => {
    const newTime = newValue as number;
    setCurrentTime(newTime);
    
    // 如果正在播放，更新播放位置
    if (audioPlayer) {
      audioPlayer.currentTime = newTime;
    }
  };

  // 時間軸拖拽開始
  const handleTimelineDragStart = () => {
    setIsDragging(true);
  };

  // 時間軸拖拽結束
  const handleTimelineDragEnd = () => {
    setIsDragging(false);
  };

  // 格式化時間顯示
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 語音轉字幕功能
  const handleTranscribeAudio = async (audioUrl: string, caseId: number) => {
    try {
      setIsTranscribing(true);
      setTranscriptionText('');
      
      console.log('開始語音轉字幕:', audioUrl);
      
      const response = await caseSpeechService.transcribeFromUrl(audioUrl);
      
      console.log('語音轉字幕成功:', response);
      setTranscriptionText(response.text);
      
    } catch (error: any) {
      console.error('語音轉字幕失敗:', error);
      alert(`語音轉字幕失敗：${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // 格式化日期為 yyyy-mm-dd
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // 檢查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('無效的日期格式:', dateString);
        return '';
      }
      
      // 使用本地時間而不是 UTC 時間
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}`;
      console.log('日期格式化:', { input: dateString, output: formattedDate });
      
      return formattedDate;
    } catch (error) {
      console.error('日期格式化錯誤:', error, dateString);
      return '';
    }
  };



  // 處理圖片選擇
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>, caseId: number) => {
    const file = event.target.files?.[0];
    if (file) {
      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        setErrorMessage('請選擇圖片檔案');
        setErrorDetails([]);
        setErrorDialogOpen(true);
        return;
      }
      
      // 檢查檔案大小 (限制為 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('圖片大小不能超過 5MB');
        setErrorDetails([]);
        setErrorDialogOpen(true);
        return;
      }
      
      // 先預覽圖片
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setImagePreviewMap(prev => new Map(prev).set(caseId, previewUrl));
      };
      reader.readAsDataURL(file);
      
      // 將檔案暫存，等待儲存時再上傳
      const editFormData = editFormDataMap.get(caseId);
      if (editFormData) {
        const updatedFormData = { ...editFormData, imageFile: file };
        setEditFormDataMap(prev => new Map(prev).set(caseId, updatedFormData));
      }
    }
  };

  // 處理音檔選擇
  const handleAudioSelect = (event: React.ChangeEvent<HTMLInputElement>, caseId: number) => {
    const file = event.target.files?.[0];
    console.log('🎵 音檔選擇事件觸發:', { file, caseId });
    
    if (file) {
      console.log('🎵 選擇的音檔資訊:', { 
        name: file.name, 
        type: file.type, 
        size: file.size,
        sizeInMB: (file.size / 1024 / 1024).toFixed(2) + 'MB'
      });
      
      // 檢查檔案類型
      if (!file.type.startsWith('audio/')) {
        console.error('❌ 檔案類型錯誤:', file.type);
        setErrorMessage('請選擇音檔檔案');
        setErrorDetails([]);
        setErrorDialogOpen(true);
        return;
      }
      
      // 檢查檔案大小 (限制為 50MB)
      if (file.size > 50 * 1024 * 1024) {
        console.error('❌ 檔案大小超過限制:', file.size);
        setErrorMessage('音檔大小不能超過 50MB');
        setErrorDetails([]);
        setErrorDialogOpen(true);
        return;
      }
      
      // 先預覽音檔
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setAudioPreviewMap(prev => new Map(prev).set(caseId, previewUrl));
        console.log('🎵 音檔預覽 URL 已設定:', previewUrl.substring(0, 50) + '...');
      };
      reader.readAsDataURL(file);
      
      // 將檔案暫存，等待儲存時再上傳
      const editFormData = editFormDataMap.get(caseId);
      console.log('🎵 當前編輯資料:', editFormData);
      
      if (editFormData) {
        const updatedFormData = { ...editFormData, audioFile: file };
        setEditFormDataMap(prev => new Map(prev).set(caseId, updatedFormData));
        console.log('✅ 音檔已暫存到編輯資料中');
      } else {
        console.error('❌ 找不到對應的編輯資料');
      }
    } else {
      console.log('❌ 沒有選擇檔案');
    }
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

      {/* 成功訊息 */}
      {submitMessage && (
        <Alert 
          severity={submitMessage.type} 
          sx={{ mb: 2 }} 
          onClose={() => setSubmitMessage(null)}
        >
          {submitMessage.text}
        </Alert>
      )}

      {/* 搜尋區域 */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: THEME_COLORS.BACKGROUND_CARD }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder={`請輸入關鍵字搜尋個案`}
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
            sx={{ 
              minWidth: 100, 
              bgcolor: THEME_COLORS.PRIMARY,
              color: 'white',
              '&:hover': {
                bgcolor: THEME_COLORS.PRIMARY_HOVER,
                color: 'white',
              },
              '&:disabled': {
                bgcolor: THEME_COLORS.DISABLED_BG,
                color: THEME_COLORS.DISABLED_TEXT,
              }
            }}
          >
            {loading ? '搜尋中...' : '查詢'}
          </Button>
          
          {/* 清除搜尋按鈕 */}
          <Button
            variant="outlined"
            onClick={() => {
              setSearchContent('');
              loadCases(1);
            }}
            sx={{ 
              minWidth: 80,
              borderColor: THEME_COLORS.BORDER_DEFAULT,
              color: THEME_COLORS.TEXT_SECONDARY,
              '&:hover': {
                borderColor: THEME_COLORS.PRIMARY,
                backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
              }
            }}
          >
            清除
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
              <TableCell sx={{ fontWeight: 600, color: THEME_COLORS.TEXT_SECONDARY }}>年齡</TableCell>
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
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>載入中...</Typography>
                </TableCell>
              </TableRow>
            ) : caseRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
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
                        {record.profileImage ? (
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2px solid ${THEME_COLORS.BORDER_LIGHT}`,
                            bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                          }}>
                            <img
                              src={record.profileImage}
                              alt={`${record.name}的照片`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                              onError={(e) => {
                                // 圖片加載失敗時，隱藏圖片並顯示默認頭像
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div style="width: 100%; height: 100%; background-color: ${THEME_COLORS.PRIMARY}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">${record.name.charAt(0)}</div>`;
                                }
                              }}
                            />
                          </Box>
                        ) : (
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: record.gender === 'Male' ? THEME_COLORS.MALE_AVATAR : THEME_COLORS.FEMALE_AVATAR,
                              border: `2px solid ${THEME_COLORS.BORDER_LIGHT}`,
                            }}
                          >
                            {record.name.charAt(0)}
                          </Avatar>
                        )}
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
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: record.gender === 'Male' ? '#1976d2' : '#d32f2f',
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_PRIMARY }}>
                      {calculateAge(record.birthday)}歲
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
                        sx={{ 
                          backgroundColor: getDifficultyColor(record.description), 
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
                      {formatDate(record.createdAt)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRowExpansion(record.caseId);
                        }}
                        sx={{ color: THEME_COLORS.TEXT_SECONDARY }}
                        title={expandedRows.includes(record.caseId) ? "收合詳細資料" : "展開詳細資料"}
                      >
                        {expandedRows.includes(record.caseId) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* 詳細資料展開行 */}
                  <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                      <Collapse in={expandedRows.includes(record.caseId)} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                          margin: 2, 
                          p: 3, 
                          bgcolor: THEME_COLORS.BACKGROUND_PRIMARY, 
                          borderRadius: 2,
                          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                        }}>
                          <Typography variant="h6" sx={{ color: THEME_COLORS.TEXT_PRIMARY, mb: 2 }}>
                            詳細資料
                          </Typography>
                          
                                                                                  {expandedRows.includes(record.caseId) && editFormDataMap.get(record.caseId) && (() => {
                            const editFormData = editFormDataMap.get(record.caseId);
                            return editFormData && (
                              // 編輯模式
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                              {/* 圖片上傳區域 */}
                              <Box sx={{ gridColumn: '1 / -1', mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                  個人照片
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: `2px solid ${THEME_COLORS.BORDER_LIGHT}`,
                                    bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    {imagePreviewMap.get(record.caseId) ? (
                                      <img
                                        src={imagePreviewMap.get(record.caseId)}
                                        alt={`${editFormData.name}的照片預覽`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    ) : editFormData.profileImage ? (
                                      <img
                                        src={editFormData.profileImage}
                                        alt={`${editFormData.name}的照片`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <Typography variant="body2" color="textSecondary">
                                        無照片
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box>
                                    <input
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      id={`image-upload-${record.caseId}`}
                                      type="file"
                                      onChange={(e) => handleImageSelect(e, record.caseId)}
                                    />
                                    <label htmlFor={`image-upload-${record.caseId}`}>
                                      <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={imageUploadLoading === record.caseId ? <CircularProgress size={20} /> : <PhotoCamera />}
                                        disabled={imageUploadLoading === record.caseId}
                                        sx={{ 
                                          borderColor: THEME_COLORS.BORDER_DEFAULT,
                                          color: THEME_COLORS.TEXT_SECONDARY,
                                          '&:hover': {
                                            borderColor: THEME_COLORS.PRIMARY,
                                            backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
                                            color: THEME_COLORS.PRIMARY,
                                          }
                                        }}
                                      >
                                        {imageUploadLoading === record.caseId ? '上傳中...' : '變更圖片'}
                                      </Button>
                                    </label>
                                  </Box>
                                </Box>
                              </Box>

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
                                value={formatDateForInput(editFormData.birthday || '')}
                                onChange={(e) => {
                                  console.log('日期變更:', e.target.value);
                                  handleEditInputChange('birthday', e.target.value);
                                }}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                  min: '1900-01-01',
                                  max: new Date().toISOString().split('T')[0]
                                }}
                                placeholder="請選擇生日"
                                helperText="請選擇 1900 年至今的日期"
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

                              <Box sx={{ display: 'flex', gap: 2, gridColumn: '1 / -1' }}>
                                <TextField
                                  label="電話"
                                  value={editFormData.phone}
                                  onChange={(e) => handleEditInputChange('phone', e.target.value)}
                                  error={fieldErrors.phone}
                                  helperText={fieldErrors.phone ? '電話為必填' : ''}
                                  sx={{ flex: 1 }}
                                />

                                <TextField
                                  label="Email"
                                  type="email"
                                  value={editFormData.email}
                                  onChange={(e) => handleEditInputChange('email', e.target.value)}
                                  error={fieldErrors.email}
                                  helperText={fieldErrors.email ? 'Email為必填' : ''}
                                  sx={{ flex: 1 }}
                                />
                              </Box>

                              <Box sx={{ display: 'flex', gap: 2, gridColumn: '1 / -1' }}>
                                <TextField
                                  select
                                  label="城市"
                                  value={editFormData.city}
                                  onChange={(e) => handleEditInputChange('city', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{ flex: 1 }}
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
                                  sx={{ flex: 1 }}
                                >
                                  <MenuItem value="">請選擇地區</MenuItem>
                                  {(districtOptions[editFormData.city] ? districtOptions[editFormData.city] : []).map((option: string) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                  ))}
                                </TextField>

                                <TextField
                                  label="詳細地址"
                                  value={editFormData.detailAddress}
                                  onChange={(e) => handleEditInputChange('detailAddress', e.target.value)}
                                  placeholder="請輸入詳細地址"
                                  sx={{ flex: 2 }}
                                />
                              </Box>

                              <TextField
                                select
                                label="困難類型"
                                value={editFormData.description}
                                onChange={(e) => handleEditInputChange('description', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ gridColumn: '1 / -1' }}
                              >
                                <MenuItem value="">請選擇困難類型</MenuItem>
                                {difficultyOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box 
                                        sx={{ 
                                          width: 12, 
                                          height: 12, 
                                          borderRadius: '50%',
                                          backgroundColor: getDifficultyColor(option)
                                        }} 
                                      />
                                      {option}
                                    </Box>
                                  </MenuItem>
                                ))}
                              </TextField>

                              {/* 音檔播放器 */}
                              <Box sx={{ gridColumn: '1 / -1' }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                  語音檔案
                                </Typography>
                                {editFormData.speechToTextAudioUrl ? (
                                  <Box sx={{ 
                                    p: 2, 
                                    bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                                    borderRadius: 1,
                                    border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5
                                  }}>
                                    {/* 播放控制 */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handlePlayAudio(editFormData.speechToTextAudioUrl!, record.caseId)}
                                        sx={{ 
                                          color: currentPlayingCaseId === record.caseId && isPlaying ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY,
                                          '&:hover': {
                                            color: currentPlayingCaseId === record.caseId && isPlaying ? THEME_COLORS.ERROR_DARK : THEME_COLORS.PRIMARY_HOVER,
                                          }
                                        }}
                                        title={currentPlayingCaseId === record.caseId && isPlaying ? "停止播放" : "播放語音"}
                                      >
                                        {currentPlayingCaseId === record.caseId && isPlaying ? <Pause /> : <PlayArrow />}
                                      </IconButton>
                                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                                        {currentPlayingCaseId === record.caseId && isPlaying ? "播放中..." : "點擊播放語音"}
                                      </Typography>
                                    </Box>

                                    {/* 播放時間軸 - 預設顯示 */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: 40, fontSize: '0.75rem' }}>
                                        {formatTime(currentTime)}
                                      </Typography>
                                      <Slider
                                        value={currentTime}
                                        onChange={handleTimelineChange}
                                        onMouseDown={handleTimelineDragStart}
                                        onMouseUp={handleTimelineDragEnd}
                                        min={0}
                                        max={duration || 0}
                                        step={0.1}
                                        disabled={!duration}
                                        sx={{
                                          flex: 1,
                                          '& .MuiSlider-thumb': {
                                            backgroundColor: THEME_COLORS.PRIMARY,
                                            width: 16,
                                            height: 16,
                                            '&:hover': {
                                              boxShadow: `0 0 0 8px ${THEME_COLORS.PRIMARY}1A`,
                                            },
                                          },
                                          '& .MuiSlider-track': {
                                            backgroundColor: THEME_COLORS.PRIMARY,
                                            height: 4,
                                          },
                                          '& .MuiSlider-rail': {
                                            backgroundColor: THEME_COLORS.BORDER_DEFAULT,
                                            height: 4,
                                          }
                                        }}
                                      />
                                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: 40, fontSize: '0.75rem' }}>
                                        {formatTime(duration)}
                                      </Typography>
                                    </Box>

                                    {/* 音量控制 - 小型化 */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <VolumeUp sx={{ fontSize: 16, color: THEME_COLORS.TEXT_SECONDARY }} />
                                      <Slider
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        size="small"
                                        sx={{
                                          width: 100,
                                          '& .MuiSlider-thumb': {
                                            backgroundColor: THEME_COLORS.PRIMARY,
                                            width: 12,
                                            height: 12,
                                          },
                                          '& .MuiSlider-track': {
                                            backgroundColor: THEME_COLORS.PRIMARY,
                                            height: 2,
                                          },
                                          '& .MuiSlider-rail': {
                                            backgroundColor: THEME_COLORS.BORDER_DEFAULT,
                                            height: 2,
                                          }
                                        }}
                                      />
                                      <Typography variant="caption" color="textSecondary" sx={{ minWidth: 30, fontSize: '0.7rem' }}>
                                        {Math.round(volume * 100)}%
                                      </Typography>
                                    </Box>

                                    {/* 音檔操作按鈕 */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                      {/* 語音轉字幕按鈕 */}
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleTranscribeAudio(editFormData.speechToTextAudioUrl!, record.caseId)}
                                        disabled={isTranscribing}
                                        startIcon={isTranscribing ? <CircularProgress size={14} /> : null}
                                        sx={{
                                          borderColor: THEME_COLORS.PRIMARY,
                                          color: THEME_COLORS.PRIMARY,
                                          fontSize: '0.75rem',
                                          py: 0.5,
                                          px: 1.5,
                                          '&:hover': {
                                            borderColor: THEME_COLORS.PRIMARY_DARK,
                                            backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
                                          },
                                          '&:disabled': {
                                            borderColor: THEME_COLORS.DISABLED_BG,
                                            color: THEME_COLORS.DISABLED_TEXT,
                                          }
                                        }}
                                      >
                                        {isTranscribing ? '轉字幕中...' : '語音轉字幕'}
                                      </Button>

                                      {/* 變更音檔按鈕 */}
                                      <Box>
                                        <input
                                          accept="audio/*"
                                          style={{ display: 'none' }}
                                          id={`audio-upload-${record.caseId}`}
                                          type="file"
                                          onChange={(e) => handleAudioSelect(e, record.caseId)}
                                        />
                                        <label htmlFor={`audio-upload-${record.caseId}`}>
                                          <Button
                                            variant="outlined"
                                            component="span"
                                            size="small"
                                            startIcon={audioUploadLoading === record.caseId ? <CircularProgress size={14} /> : <Audiotrack />}
                                            disabled={audioUploadLoading === record.caseId}
                                            onClick={() => console.log('🎵 變更音檔按鈕被點擊！', record.caseId)}
                                            sx={{
                                              borderColor: THEME_COLORS.INFO,
                                              color: THEME_COLORS.INFO,
                                              fontSize: '0.75rem',
                                              py: 0.5,
                                              px: 1.5,
                                              '&:hover': {
                                                borderColor: THEME_COLORS.INFO,
                                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                              },
                                              '&:disabled': {
                                                borderColor: THEME_COLORS.DISABLED_BG,
                                                color: THEME_COLORS.DISABLED_TEXT,
                                              }
                                            }}
                                          >
                                            {audioUploadLoading === record.caseId ? '上傳中...' : '變更音檔'}
                                          </Button>
                                        </label>
                                      </Box>
                                    </Box>

                                    {/* 字幕顯示區域 */}
                                    {transcriptionText && (
                                      <Box sx={{ 
                                        mt: 1, 
                                        p: 2, 
                                        bgcolor: THEME_COLORS.BACKGROUND_PRIMARY,
                                        borderRadius: 1,
                                        border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`
                                      }}>
                                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                          語音轉字幕結果：
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                          whiteSpace: 'pre-wrap',
                                          lineHeight: 1.6,
                                          color: THEME_COLORS.TEXT_PRIMARY
                                        }}>
                                          {transcriptionText}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                ) : (
                                  <Box sx={{ 
                                    p: 2, 
                                    bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
                                    borderRadius: 1,
                                    border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5
                                  }}>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                      此個案暫無語音檔案
                                    </Typography>
                                    
                                    {/* 新增音檔按鈕 */}
                                    <Box>
                                      <input
                                        accept="audio/*"
                                        style={{ display: 'none' }}
                                        id={`audio-upload-${record.caseId}`}
                                        type="file"
                                        onChange={(e) => handleAudioSelect(e, record.caseId)}
                                      />
                                      <label htmlFor={`audio-upload-${record.caseId}`}>
                                        <Button
                                          variant="outlined"
                                          component="span"
                                          size="small"
                                          startIcon={audioUploadLoading === record.caseId ? <CircularProgress size={14} /> : <Audiotrack />}
                                          disabled={audioUploadLoading === record.caseId}
                                          onClick={() => console.log('🎵 新增音檔按鈕被點擊！', record.caseId)}
                                          sx={{
                                            borderColor: THEME_COLORS.INFO,
                                            color: THEME_COLORS.INFO,
                                            fontSize: '0.75rem',
                                            py: 0.5,
                                            px: 1.5,
                                            '&:hover': {
                                              borderColor: THEME_COLORS.INFO,
                                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                            },
                                            '&:disabled': {
                                              borderColor: THEME_COLORS.DISABLED_BG,
                                              color: THEME_COLORS.DISABLED_TEXT,
                                            }
                                          }}
                                        >
                                          {audioUploadLoading === record.caseId ? '上傳中...' : '新增音檔'}
                                        </Button>
                                      </label>
                                    </Box>
                                  </Box>
                                )}
                              </Box>

                              {/* 操作按鈕 - 左下角 */}
                              <Box sx={{ display: 'flex', gap: 2, gridColumn: '1 / -1', mt: 2, justifyContent: 'flex-start' }}>
                                <Button
                                  variant="contained"
                                  onClick={handleSave}
                                  disabled={loading}
                                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                  sx={{ 
                                    bgcolor: THEME_COLORS.PRIMARY,
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: THEME_COLORS.PRIMARY_HOVER,
                                      color: 'white',
                                    },
                                    '&:disabled': {
                                      bgcolor: THEME_COLORS.DISABLED_BG,
                                      color: THEME_COLORS.DISABLED_TEXT,
                                    }
                                  }}
                                >
                                  {loading ? '儲存中...' : '儲存'}
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={handleCancel}
                                  startIcon={<Cancel />}
                                  sx={{ 
                                    borderColor: THEME_COLORS.BORDER_DEFAULT,
                                    color: THEME_COLORS.TEXT_SECONDARY,
                                    '&:hover': {
                                      borderColor: THEME_COLORS.PRIMARY,
                                      backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
                                      color: THEME_COLORS.PRIMARY,
                                    }
                                  }}
                                >
                                  取消
                                </Button>
                                {canDeleteCase() && (
                                  <Button
                                    variant="outlined"
                                    onClick={() => handleDeleteClick(record)}
                                    startIcon={<Delete />}
                                    sx={{ 
                                      borderColor: THEME_COLORS.ERROR,
                                      color: THEME_COLORS.ERROR,
                                      '&:hover': {
                                        borderColor: THEME_COLORS.ERROR_DARK,
                                        backgroundColor: '#ffebee',
                                        color: THEME_COLORS.ERROR_DARK,
                                      }
                                    }}
                                  >
                                    刪除
                                  </Button>
                                )}
                              </Box>
                            </Box>
                            );
                          })()}
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

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: THEME_COLORS.TEXT_SECONDARY }}>
            顯示第 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, totalCount)} 項，共 {totalCount} 項
          </Typography>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            disabled={loading}
          />
        </Stack>
      )}

      {/* 刪除確認對話框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          color: THEME_COLORS.ERROR,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Delete />
          刪除個案確認
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            您即將刪除個案資料，此操作<strong>不可復原</strong>。
          </DialogContentText>
          {deleteRecord && (
            <Box sx={{ 
              bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
              p: 2,
              borderRadius: 1,
              mb: 2
            }}>
              <Typography variant="subtitle2" color="textSecondary">個案資訊：</Typography>
              <Typography><strong>姓名：</strong>{deleteRecord.name}</Typography>
              <Typography><strong>身分證字號：</strong>{detailsCache.get(deleteRecord.caseId)?.identityNumber || '未載入'}</Typography>
              <Typography><strong>電話：</strong>{deleteRecord.phone}</Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ mb: 1, color: THEME_COLORS.ERROR }}>
            為了確保安全，請輸入個案姓名 "<strong>{deleteRecord?.name}</strong>" 以確認刪除：
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            placeholder={`請輸入: ${deleteRecord?.name}`}
            error={deleteConfirmName !== '' && deleteConfirmName !== deleteRecord?.name}
            helperText={
              deleteConfirmName !== '' && deleteConfirmName !== deleteRecord?.name 
                ? '姓名不符，請重新輸入'
                : ''
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ 
              borderColor: THEME_COLORS.BORDER_DEFAULT,
              color: THEME_COLORS.TEXT_SECONDARY,
              '&:hover': {
                borderColor: THEME_COLORS.PRIMARY,
                backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
                color: THEME_COLORS.PRIMARY,
              }
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleteConfirmName !== deleteRecord?.name || deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <Delete />}
            sx={{ 
              bgcolor: THEME_COLORS.ERROR,
              color: 'white',
              '&:hover': {
                bgcolor: THEME_COLORS.ERROR_DARK,
                color: 'white',
              },
              '&:disabled': {
                bgcolor: THEME_COLORS.DISABLED_BG,
                color: THEME_COLORS.DISABLED_TEXT,
              }
            }}
          >
            {deleteLoading ? '刪除中...' : '確認刪除'}
          </Button>
        </DialogActions>
      </Dialog>



      {/* 錯誤提示對話框 */}
      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          color: THEME_COLORS.ERROR,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1
        }}>
          <Delete />
          錯誤提示
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <DialogContentText sx={{ mb: 1 }}>
            {errorMessage}
          </DialogContentText>
          {errorDetails.length > 0 && (
            <Box sx={{ 
              bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
              p: 1.5,
              borderRadius: 1,
              mb: 1.5
            }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>
                相關資料：
              </Typography>
              {errorDetails.map((detail, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.25 }}>
                  • {detail}
                </Typography>
              ))}
            </Box>
          )}
          {errorDetails.length > 0 && (
            <Typography variant="body2" color="textSecondary">
              請先刪除上述相關資料後，再嘗試刪除個案。
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={() => setErrorDialogOpen(false)}
            variant="contained"
            size="small"
            sx={{ 
              bgcolor: THEME_COLORS.PRIMARY,
              color: 'white',
              '&:hover': {
                bgcolor: THEME_COLORS.PRIMARY_HOVER,
                color: 'white',
              }
            }}
          >
            了解
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchEditCaseTab; 