import React from 'react';
import Select from 'react-select';
import styled from 'styled-components';

const Test = styled.div`
  display: flex;
  align-items: center;
`;

// Custom styles for react-select
const customStyles = {
  control: (provided) => ({
    ...provided,
    width: '100%', // You can set the width to any value you like
  }),
  // You can add more custom styles if needed for other parts of the Select
};

const SortingOptions = ({ onSortCriteriaChange }) => {
  const options = [
    { value: 'Alphabetical', label: 'Alphabetical' },
    { value: 'ReverseAlphabetical', label: 'Reverse Alphabetical' },
    { value: 'Course Code', label: 'Course Code' },
    { value: 'Course Code Reverse', label: 'Course Code Reverse' },
  ];

  return (
    <Test>
      <Select
        isSearchable={false}
        options={options}
        onChange={(selectedOption) =>
          onSortCriteriaChange(selectedOption.value)
        }
        defaultValue={options[0]} // Set default value to "Alphabetical"
        styles={customStyles} // Apply the custom styles
      />
    </Test>
  );
};

export default SortingOptions;
