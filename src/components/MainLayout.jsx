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

  /* width: 100%; */
  /* max-width: 1440px; */
  /* min-width: 780px; */
  /* width: calc(100% - 100px); */

  width: min(100% - 2rem, 1440px);
  margin-inline: auto;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
