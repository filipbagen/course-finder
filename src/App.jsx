import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';

// components
import PrivateRoute from './components/PrivateRoute';
import CourseBrowser from './components/CourseBrowser';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Signup from './components/SignUp';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <>
      {/* <Login /> */}
      <Container>
        <Router>
          <AuthProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <CourseBrowser />
                  </PrivateRoute>
                }
              />

              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </AuthProvider>
        </Router>
      </Container>
    </>
  );
};

export default App;

// styled
const Container = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
