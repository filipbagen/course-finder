import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <Nav>
      <Logo src="img/logo.png" alt="Logo" />

      <NavLinks>
        <NavLink as={Link} to="/">
          Home
        </NavLink>
        <NavLink as={Link} to="/schedule">
          Schedule
        </NavLink>
      </NavLinks>

      <div>
        <ProfileButton as={Link} to="/profile">
          My Profile
        </ProfileButton>

        <LanguageSelector>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </LanguageSelector>
      </div>
    </Nav>
  );
};

export default Navigation;

const Nav = styled.nav`
  box-sizing: border-box;
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 58px;

  /* position: -webkit-sticky;
  position: sticky;
  top: 0; */
`;

const Logo = styled.img`
  height: 100%;
`;

const NavLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NavLink = styled.a`
  margin: 0 1rem;
  font-size: 1.2rem;
  color: #333;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: var(--mainColor);
    transition: 0.2s;
  }
`;

const ProfileButton = styled.button`
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
  color: #fff;
  background-color: var(--mainColor);
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const LanguageSelector = styled.select`
  margin-left: 1rem;
  padding: 0.5rem;
  font-size: 1.2rem;
  color: #333;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
`;
