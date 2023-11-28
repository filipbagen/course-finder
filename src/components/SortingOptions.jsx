import React from 'react';
import Select from 'react-select';
import styled from 'styled-components';

const SortingOptions = ({ onSortCriteriaChange }) => {
  // Custom styles for react-select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: '100%', // You can set the width to any value you like
      height: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 'bold',
      border: 'none',
      backgroundColor: 'var(--mainColor)',
    }),
    // You can add more custom styles if needed for other parts of the Select
    color: 'white',
  };

  const options = [
    { value: 'Alphabetical', label: 'Alphabetical' },
    { value: 'ReverseAlphabetical', label: 'Reverse Alphabetical' },
    { value: 'Course Code', label: 'Course Code' },
    { value: 'Course Code Reverse', label: 'Course Code Reverse' },
  ];

  return (
    <Container>
      <p style={{ marginRight: '8px', fontWeight: 'bold' }}>Sort by:</p>

      {/* The Select component from react-select */}
      <Select
        isSearchable={false}
        options={options}
        onChange={(selectedOption) =>
          onSortCriteriaChange(selectedOption.value)
        }
        defaultValue={options[0]} // Set default value to "Alphabetical"
        styles={customStyles} // Apply the custom styles
      />
    </Container>
  );
};

export default SortingOptions;

// style
const Container = styled.div`
  display: flex;
  align-items: center;
`;
