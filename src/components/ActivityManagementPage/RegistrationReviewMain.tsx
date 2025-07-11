import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { THEME_COLORS } from '../../styles/theme';
import CaseRegistrationReview from './CaseRegistrationReview';
import PublicRegistrationReview from './PublicRegistrationReview';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`registration-tabpanel-${index}`}
      aria-labelledby={`registration-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const RegistrationReviewMain: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="報名審核標籤"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 48,
              color: THEME_COLORS.TEXT_SECONDARY,
              '&.Mui-selected': {
                color: THEME_COLORS.PRIMARY,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: THEME_COLORS.PRIMARY,
            },
          }}
        >
          <Tab label="個案報名" />
          <Tab label="民眾報名" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <CaseRegistrationReview />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <PublicRegistrationReview />
      </TabPanel>
    </Box>
  );
};

export default RegistrationReviewMain; 