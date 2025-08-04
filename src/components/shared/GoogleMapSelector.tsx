import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Popper,
  ClickAwayListener,
  Autocomplete as MuiAutocomplete,
} from '@mui/material';
import {
  MyLocation,
  Clear,
  LocationOn,
  Place,
} from '@mui/icons-material';
import { THEME_COLORS } from '../../styles/theme';
import { config } from '../../config/env';
import { commonStyles } from '../../styles/commonStyles';

// Google Maps 類型定義
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    googleMapsLoading?: boolean;
  }
}

interface LocationData {
  address: string;
  placeName: string; // 新增：地點名稱
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface SuggestionItem {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GoogleMapSelectorProps {
  value?: LocationData;
  onChange?: (location: LocationData) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

const GoogleMapSelector: React.FC<GoogleMapSelectorProps> = React.memo(({
  value,
  onChange,
  onError,
  disabled = false,
  placeholder = "輸入地址搜尋位置...",
  label = "活動地點"
}) => {
  const [address, setAddress] = useState(value?.address || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [marker, setMarker] = useState<any>(null);
  const [map, setMap] = useState<any>(null);
  const [geocoder, setGeocoder] = useState<any>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [initRetryCount, setInitRetryCount] = useState(0);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 載入 Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setMapLoaded(true);
        return;
      }

      // 檢查是否已經有Google Maps script標籤
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // 如果已經存在，直接設置為已載入
        setMapLoaded(true);
        return;
      }

      // 檢查是否正在載入中
      if (window.googleMapsLoading) {
        return;
      }

      window.googleMapsLoading = true;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=places&language=zh-TW&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        // 確保 Google Maps API 完全載入後再設置狀態
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            setMapLoaded(true);
            window.googleMapsLoading = false;
          } else {
            console.error('Google Maps API 載入不完整');
            setError('地圖載入失敗，請重新整理頁面');
            window.googleMapsLoading = false;
          }
        }, 100);
      };

      script.onerror = () => {
        console.error('Google Maps API 載入失敗');
        window.googleMapsLoading = false;
        setError('地圖載入失敗，請檢查網路連線');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();

    // 清理函數
    return () => {
      // 清除定時器
      if ((window as any).addressSearchTimer) {
        clearTimeout((window as any).addressSearchTimer);
      }
    };
  }, []);

  // 初始化地圖
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      // 確保 Google Maps API 完全載入
      console.log('等待 Google Maps API 完全載入...', {
        google: !!window.google,
        maps: !!(window.google && window.google.maps),
        Map: !!(window.google && window.google.maps && window.google.maps.Map)
      });
      return;
    }

    // 如果地圖已經存在，不要重新初始化
    if (map) {
      return;
    }

    try {
      // 初始化地圖
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: value ? { lat: value.latitude, lng: value.longitude } : config.googleMaps.defaultCenter,
        zoom: config.googleMaps.defaultZoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: 'cooperative', // 改善移動設備體驗
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(newMap);

      // 初始化地理編碼器
      const newGeocoder = new window.google.maps.Geocoder();
      setGeocoder(newGeocoder);

      // 初始化自動完成服務
      const newAutocompleteService = new window.google.maps.places.AutocompleteService();
      setAutocomplete(newAutocompleteService);

      // 如果有初始值，設置標記
      if (value) {
        const position = { lat: value.latitude, lng: value.longitude };
        // 直接設置標記，避免依賴循環
        const newMarker = new window.google.maps.Marker({
          position,
          map: newMap,
          draggable: true,
          animation: null,
          title: '選擇的位置',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }
        });
        setMarker(newMarker);
      }

    } catch (err) {
      console.error('地圖初始化失敗:', err);
      
      // 重試機制：最多重試3次
      if (initRetryCount < 3) {
        console.log(`地圖初始化失敗，${1000 * (initRetryCount + 1)}ms 後重試...`);
        setTimeout(() => {
          setInitRetryCount(prev => prev + 1);
        }, 1000 * (initRetryCount + 1));
      } else {
        setError('地圖載入失敗，請檢查網路連線');
        onError?.('地圖載入失敗');
      }
    }
  }, [mapLoaded, value, onChange, onError, map, initRetryCount]);

  // 反向地理編碼
  const reverseGeocode = useCallback(async (position: any) => {
    if (!geocoder) return;

    try {
      // 請求中文地址
      geocoder.geocode({ 
        location: position,
        language: 'zh-TW' // 指定中文語言
      }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          // 支援兩種型別：Google Maps LatLng 物件和普通物件
          const getLat = (pos: any) => (typeof pos.lat === 'function' ? pos.lat() : pos.lat);
          const getLng = (pos: any) => (typeof pos.lng === 'function' ? pos.lng() : pos.lng);
          
          const locationData: LocationData = {
            address: results[0].formatted_address,
            placeName: results[0].formatted_address.split(',')[0] || results[0].formatted_address, // 取第一個逗號前的部分作為地點名稱
            latitude: getLat(position),
            longitude: getLng(position),
            formattedAddress: results[0].formatted_address
          };

          setAddress(results[0].formatted_address.split(',')[0] || results[0].formatted_address); // 設置地點名稱
          onChange?.(locationData);
          setError(null);
        }
      });
    } catch (err) {
      console.error('反向地理編碼失敗:', err);
    }
  }, [geocoder, onChange]);

  // 更新標記
  const updateMarker = useCallback((position: any) => {
    // 清除舊標記
    if (marker) {
      marker.setMap(null);
    }

    // 創建新標記，使用更明顯的樣式
    const newMarker = new window.google.maps.Marker({
      position,
      map,
      draggable: true,
      animation: null, // 移除動畫以避免閃爍
      title: '選擇的位置',
      // 使用自定義圖標讓標記更明顯
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32)
      }
    });

    // 添加拖拽結束事件
    newMarker.addListener('dragend', () => {
      const newPosition = newMarker.getPosition();
      reverseGeocode(newPosition);
    });

    // 添加點擊事件顯示信息窗口
    const infoWindow = new window.google.maps.InfoWindow({
      content: '<div style="padding: 8px;"><strong>選擇的位置</strong><br>您可以拖拽此標記調整位置</div>'
    });

    newMarker.addListener('click', () => {
      infoWindow.open(map, newMarker);
    });

    // 設置標記並更新地圖
    setMarker(newMarker);
    
    // 平滑移動到新位置，但減少動畫時間
    map.panTo(position);
    map.setZoom(16); // 稍微放大一點以便更清楚地看到位置
    
    // 支援兩種型別：Google Maps LatLng 物件和普通物件
    const getLat = (pos: any) => (typeof pos.lat === 'function' ? pos.lat() : pos.lat);
    const getLng = (pos: any) => (typeof pos.lng === 'function' ? pos.lng() : pos.lng);
    
    console.log('📍 標記已更新到位置:', getLat(position), getLng(position));
  }, [map, marker, reverseGeocode]);

  // 獲取搜尋建議
  const getSuggestions = useCallback(async (input: string) => {
    if (!autocomplete || !input.trim() || input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      autocomplete.getPlacePredictions({
        input: input,
        componentRestrictions: { country: 'tw' },
        types: ['geocode', 'establishment'],
        language: 'zh-TW' // 指定中文語言
      }, (predictions: SuggestionItem[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.slice(0, 5)); // 限制顯示5個建議
          setShowSuggestions(true);
          setSelectedSuggestionIndex(-1);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } catch (err) {
      console.error('獲取建議失敗:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [autocomplete]);

  // 處理地址輸入變化
  const handleAddressChange = useCallback((newAddress: string) => {
    setAddress(newAddress);
    setError(null);
    
    // 清除之前的定時器
    if ((window as any).addressSearchTimer) {
      clearTimeout((window as any).addressSearchTimer);
    }
    
    // 延遲獲取建議，避免過於頻繁的API調用
    (window as any).addressSearchTimer = setTimeout(() => {
      getSuggestions(newAddress);
    }, 500); // 增加到500ms以減少API調用頻率
  }, [getSuggestions]);

  // 選擇建議項目
  const handleSelectSuggestion = async (suggestion: SuggestionItem) => {
    if (!map) return;

    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);
    setAddress(suggestion.structured_formatting.main_text); // 設置地點名稱

    try {
      // 使用 Places Service 獲取詳細信息
      const placesService = new window.google.maps.places.PlacesService(map);
      
      placesService.getDetails({
        placeId: suggestion.place_id,
        fields: ['geometry', 'formatted_address'],
        language: 'zh-TW' // 指定中文語言
      }, (place: any, status: any) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          const locationData: LocationData = {
            address: place.formatted_address || suggestion.description,
            placeName: suggestion.structured_formatting.main_text, // 使用建議的主要文字作為地點名稱
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            formattedAddress: place.formatted_address || suggestion.description
          };

          updateMarker(place.geometry.location);
          onChange?.(locationData);
          setError(null);
          console.log('✅ 選擇建議成功:', place.formatted_address);
        } else {
          setError('無法獲取該位置的詳細信息');
          onError?.('獲取位置信息失敗');
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError('選擇位置失敗，請稍後再試');
      onError?.('選擇位置失敗');
    }
  };



  // 點擊地圖選擇位置
  useEffect(() => {
    if (!map) return;

    const clickListener = map.addListener('click', (event: any) => {
      const position = event.latLng;
      updateMarker(position);
      reverseGeocode(position);
    });

    return () => {
      window.google.maps.event.removeListener(clickListener);
    };
  }, [map, updateMarker, reverseGeocode]);

  // 清除位置
  const handleClear = () => {
    setAddress('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }
    onChange?.({
      address: '',
      placeName: '',
      latitude: 0,
      longitude: 0,
      formattedAddress: ''
    });
    setError(null);
  };

  // 使用當前位置
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('您的瀏覽器不支援地理定位功能');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        updateMarker(pos);
        reverseGeocode(pos);
      },
      (error) => {
        setIsLoading(false);
        setError('無法取得您的位置，請檢查定位權限');
        onError?.('定位失敗');
      }
    );
  };

  // 處理鍵盤事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        }
        // 移除搜尋功能，只保留建議選擇
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 地點名稱搜尋欄 */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ position: 'relative' }}>
          <TextField
            ref={searchInputRef}
            label={label}
            value={value?.placeName || address}
            onChange={(e) => {
              // 允許用戶編輯活動地點
              const newPlaceName = e.target.value;
              setAddress(newPlaceName);
              
              // 同時更新建議
              handleAddressChange(newPlaceName);
              
              // 如果有現有值，更新地點名稱
              if (onChange && value) {
                onChange({
                  ...value,
                  placeName: newPlaceName
                });
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            fullWidth
            disabled={disabled || !mapLoaded}
            error={!!error}
            helperText={error}
            sx={{
              ...commonStyles.formInput,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                '& fieldset': { borderColor: error ? THEME_COLORS.ERROR : THEME_COLORS.BORDER_LIGHT },
                '&:hover fieldset': { borderColor: error ? THEME_COLORS.ERROR_DARK : THEME_COLORS.PRIMARY_HOVER },
                '&.Mui-focused fieldset': { borderColor: error ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY_HOVER },
              },
              '& .MuiInputLabel-root': {
                '&.Mui-focused': {
                  color: THEME_COLORS.PRIMARY,
                },
              },
            }}
          />
          {/* 建議下拉列表 */}
          {showSuggestions && suggestions.length > 0 && (
            <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
              <Paper
                ref={suggestionsRef}
                elevation={3}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: 300,
                  overflow: 'auto',
                  mt: 0.5,
                  border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
                }}
              >
                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItemButton
                      key={suggestion.place_id}
                      selected={index === selectedSuggestionIndex}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: THEME_COLORS.PRIMARY_LIGHT_BG,
                          '&:hover': {
                            backgroundColor: THEME_COLORS.PRIMARY_TRANSPARENT,
                          },
                        },
                        '&:hover': {
                          backgroundColor: THEME_COLORS.BACKGROUND_SECONDARY,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Place sx={{ color: THEME_COLORS.PRIMARY, fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={suggestion.structured_formatting.main_text}
                        secondary={suggestion.structured_formatting.secondary_text}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          color: 'textSecondary',
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </ClickAwayListener>
          )}
        </Box>
      </Box>
      {/* 詳細地址欄位 */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="詳細地址"
          value={value?.formattedAddress || ''}
          onChange={(e) => {
            // 允許用戶編輯詳細地址
            const newFormattedAddress = e.target.value;
            if (onChange && value) {
              onChange({
                ...value,
                formattedAddress: newFormattedAddress
              });
            }
          }}
          fullWidth
          sx={{
            ...commonStyles.formInput,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
              '& fieldset': { borderColor: THEME_COLORS.BORDER_LIGHT },
              '&:hover fieldset': { borderColor: THEME_COLORS.PRIMARY_HOVER },
              '&.Mui-focused fieldset': { borderColor: THEME_COLORS.PRIMARY_HOVER },
            },
            '& .MuiInputLabel-root': {
              '&.Mui-focused': {
                color: THEME_COLORS.PRIMARY,
              },
            },
          }}
        />
      </Box>
      {/* 按鈕區塊 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={handleUseCurrentLocation}
          disabled={disabled || !mapLoaded || isLoading}
          startIcon={<MyLocation />}
          sx={{
            minWidth: 120,
            px: 3,
            borderColor: THEME_COLORS.INFO,
            color: THEME_COLORS.INFO,
            '&:hover': {
              borderColor: THEME_COLORS.INFO,
              bgcolor: 'rgba(33, 150, 243, 0.1)',
            },
          }}
        >
          我的位置
        </Button>
        <IconButton
          onClick={handleClear}
          disabled={disabled || (!address.trim() && !value?.formattedAddress)}
          sx={{
            border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
            color: THEME_COLORS.TEXT_MUTED,
            '&:hover': {
              borderColor: THEME_COLORS.ERROR,
              color: THEME_COLORS.ERROR,
              bgcolor: THEME_COLORS.ERROR_LIGHT,
            },
          }}
        >
          <Clear />
        </IconButton>
      </Box>
      {/* 地圖區域 */}
      <Paper 
        elevation={1} 
        sx={{ 
          border: `1px solid ${THEME_COLORS.BORDER_LIGHT}`,
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        {!mapLoaded ? (
          <Box sx={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: THEME_COLORS.BACKGROUND_SECONDARY
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                載入地圖中...
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            ref={mapRef}
            sx={{
              height: 300,
              width: '100%',
              position: 'relative'
            }}
          />
        )}
      </Paper>

      {/* 座標顯示 */}
      {value && value.latitude && value.longitude && (
        <Box sx={{ 
          mt: 1, 
          p: 1, 
          bgcolor: THEME_COLORS.BACKGROUND_SECONDARY,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <LocationOn sx={{ color: THEME_COLORS.PRIMARY, fontSize: 16 }} />
          <Typography variant="caption" color="textSecondary">
            經度: {value.longitude.toFixed(6)}, 緯度: {value.latitude.toFixed(6)}
          </Typography>
        </Box>
      )}

      {/* 使用說明 */}
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="textSecondary">
          💡 提示：您可以直接編輯活動地點和詳細地址，輸入時會顯示即時建議，也可以點擊地圖選擇位置或使用當前位置
        </Typography>
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => {
  // 自定義比較函數，只在關鍵屬性變化時重新渲染
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.label === nextProps.label &&
    JSON.stringify(prevProps.value) === JSON.stringify(nextProps.value)
  );
});

export default GoogleMapSelector; 