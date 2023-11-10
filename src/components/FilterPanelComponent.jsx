import React from 'react';
import styled from 'styled-components';

// style
const FilterPanel = styled.div`
  display: flex;
  width: 220px;
  padding: 18px 28px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;

  border-radius: 8px;
  background: var(--White, #fff);

  /* Box shadow */
  box-shadow: var(--box-shadow);

  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 0;
`;

// components
import FilterSection from './FilterSection';

const FilterPanelComponent = ({
  filterOptions,
  selectedFilters,
  onFilterChange,
}) => {
  // console.log(selectedFilters); // Inspect the structure and content of the selectedFilters object

  return (
    <FilterPanel>
      {Object.keys(filterOptions).map((filterType) => (
        <FilterSection
          key={filterType}
          title={filterType}
          filterType={filterType}
          filterValues={filterOptions[filterType]}
          handleFilterChange={onFilterChange(filterType)}
          selectedValues={selectedFilters[filterType]}
        />
      ))}
    </FilterPanel>
  );
};

export default FilterPanelComponent;
