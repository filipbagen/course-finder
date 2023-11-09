import React from 'react';

const SortingOptions = ({ onSortCriteriaChange }) => {
  return (
    <select
      onChange={(e) => onSortCriteriaChange(e.target.value)}
      defaultValue="Alphabetical"
      value={'Alphabetical'}
    >
      <option value="Alphabetical">Alphabetical</option>
      <option value="ReverseAlphabetical">Reverse Alphabetical</option>
      <option value="Course Code">Course Code</option>
      <option value="Course Code Reverse">Course Code Reverse</option>

      {/* Add more sort options here */}
    </select>
  );
};

export default SortingOptions;
