import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background-color: #f5f5f5;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 240px; // 與 Sidebar 寬度相同
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const MainLayout: React.FC = () => {
  return (
    <LayoutContainer>
      <Sidebar onLogout={() => {}} />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default MainLayout; 