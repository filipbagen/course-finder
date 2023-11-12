import React from 'react';
import styled from 'styled-components';

const SearchComponent = ({ onSearchChange }) => {
  return (
    <InputDiv>
      <Input onChange={onSearchChange} placeholder="Search course" />
    </InputDiv>
  );
};

export default SearchComponent;

// style
const InputDiv = styled.div`
  text-align: center;
`;

const Input = styled.input`
  border: none;
  outline: none;
  height: 26pt;
  width: 100%;
  border-radius: 10pt;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);

  &:placeholder {
    margin-left: 10pt;
  }
`;
