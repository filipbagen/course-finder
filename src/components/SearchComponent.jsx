import React from 'react';
import styled from 'styled-components';

const SearchComponent = ({ onSearchChange }) => {
  return (
    <InputDiv>
      <StyledIcon
        alt="svgImg"
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAsMCwyNTYsMjU2IgpzdHlsZT0iZmlsbDojMDAwMDAwOyI+CjxnIGZpbGw9IiM1ZWEzZjMiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1OS41NTUzOSwwKSByb3RhdGUoOTApIHNjYWxlKDMuNTU1NTYsMy41NTU1NikiPjxwYXRoIGQ9Ik0zMSwxMWMtMTEuMDI3LDAgLTIwLDguOTczIC0yMCwyMGMwLDExLjAyNyA4Ljk3MywyMCAyMCwyMGMzLjk3NDE3LDAgNy42NzIzOCwtMS4xNzg0MyAxMC43ODkwNiwtMy4xODU1NWwxMi45Mzc1LDEyLjkzNzVjMS42NjQsMS42NjQgNC4zNjIzOSwxLjY2NCA2LjAyNTM5LDBjMS42NjQsLTEuNjY0IDEuNjY0LC00LjM2MTM5IDAsLTYuMDI1MzlsLTEyLjkzNzUsLTEyLjkzNzVjMi4wMDcxMiwtMy4xMTY2OCAzLjE4NTU1LC02LjgxNDkgMy4xODU1NSwtMTAuNzg5MDZjMCwtMTEuMDI3IC04Ljk3MywtMjAgLTIwLC0yMHpNMzEsMTljNi42MTYsMCAxMiw1LjM4NCAxMiwxMmMwLDYuNjE2IC01LjM4NCwxMiAtMTIsMTJjLTYuNjE2LDAgLTEyLC01LjM4NCAtMTIsLTEyYzAsLTYuNjE2IDUuMzg0LC0xMiAxMiwtMTJ6Ij48L3BhdGg+PC9nPjwvZz4KPC9zdmc+"
      />
      <Input onChange={onSearchChange} placeholder="Search course" />
    </InputDiv>
  );
};

export default SearchComponent;

// style
const InputDiv = styled.div`
  text-align: center;
  position: relative;
  font-size: 14px;
`;

const Input = styled.input`
  border: none;
  outline: none;
  height: 26pt;
  box-sizing: border-box;
  width: 100%;
  border-radius: 100px;
  box-shadow: var(--box-shadow);
  padding-left: 42px;
  font-weight: bold;
`;

const StyledIcon = styled.img`
  position: absolute;
  left: 10pt; /* Distance from the left edge of the InputDiv */
  top: 50%; /* Center the icon vertically */
  transform: translateY(-50%); /* Center the icon vertically */
  pointer-events: none; /* This makes sure clicks "go through" the icon to the input below */
  /* Adjust width and height as necessary for your icon */
  width: 16pt;
  height: 16pt;
`;
