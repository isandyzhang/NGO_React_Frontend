import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { registrationService } from '../../services/registrationService';
import { StyledCard } from '../shared/StyledCard';
import { PageHeader } from '../shared/PageHeader';
import { PageContainer } from '../shared/PageContainer';

interface Registration {
  Id: number;
  UserId: number;
  UserName: string;
  ActivityName: string;
  NumberOfCompanions: number;
  Status: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`registration-tabpanel-${index}`}
      aria-labelledby={`registration-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const RegistrationReview: React.FC = () => {
  const [userRegistrations, setUserRegistrations] = useState<Registration[]>([]);
  const [caseRegistrations, setCaseRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 載入民眾報名
      const userResponse = await registrationService.getUserRegistrations();
      console.log('民眾報名資料:', userResponse);
      setUserRegistrations(userResponse || []);
      
      // 載入個案報名
      const caseResponse = await registrationService.getCaseRegistrations();
      console.log('個案報名資料:', caseResponse);
      setCaseRegistrations(caseResponse || []);
      
    } catch (err) {
      console.error('載入報名資料錯誤:', err);
      setError('載入報名資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return '待審核';
      case 'Approved': return '已通過';
      case 'Rejected': return '已拒絕';
      default: return status;
    }
  };

  const renderRegistrationTable = (registrations: Registration[], type: string) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>{type === 'user' ? '用戶名稱' : '個案名稱'}</TableCell>
            <TableCell>活動名稱</TableCell>
            <TableCell>同行人數</TableCell>
            <TableCell>狀態</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={`${type}-registration-${registration.Id}`}>
              <TableCell>{registration.Id}</TableCell>
              <TableCell>{registration.UserName}</TableCell>
              <TableCell>{registration.ActivityName}</TableCell>
              <TableCell>{registration.NumberOfCompanions}</TableCell>
              <TableCell>
                <Chip 
                  label={getStatusText(registration.Status)} 
                  color={getStatusColor(registration.Status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Button size="small" variant="outlined" color="primary">
                  查看詳情
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderStatistics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              民眾報名統計
            </Typography>
            <Typography variant="h4" color="primary">
              {userRegistrations.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              總報名數
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              個案報名統計
            </Typography>
            <Typography variant="h4" color="primary">
              {caseRegistrations.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              總報名數
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="報名審核管理" />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="報名審核管理" />
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadRegistrations}>
          重新載入
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="報名審核管理" />
      
      {renderStatistics()}
      
      <StyledCard>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`民眾報名 (${userRegistrations.length})`} />
            <Tab label={`個案報名 (${caseRegistrations.length})`} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            民眾報名列表
          </Typography>
          {userRegistrations.length === 0 ? (
            <Alert severity="info">暫無民眾報名資料</Alert>
          ) : (
            renderRegistrationTable(userRegistrations, 'user')
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            個案報名列表
          </Typography>
          {caseRegistrations.length === 0 ? (
            <Alert severity="info">暫無個案報名資料</Alert>
          ) : (
            renderRegistrationTable(caseRegistrations, 'case')
          )}
        </TabPanel>
      </StyledCard>
    </PageContainer>
  );
}; 