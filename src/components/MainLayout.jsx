import React from 'react';
import styled from 'styled-components';

// Compoents
import Navigation from './Navigation';

const MainLayout = ({ children }) => {
  return (
    <Container>
      <Navigation />
      <MainContent>{children}</MainContent>
    </Container>
  );
};

export default MainLayout;

// styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 52px;
  width: min(100% - 120px, 1320px);
  margin-inline: auto;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;
