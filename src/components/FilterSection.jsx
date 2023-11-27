import React from 'react';
import styled from 'styled-components';

const FilterSection = ({ title, filterValues, handleFilterChange }) => {
  return (
    <Section>
      {title && <h3>{title}</h3>}

      {filterValues.map((value) => (
        <Label key={value} htmlFor={value}>
          <input
            type="checkbox"
            onChange={(event) => handleFilterChange(event)} // Pass the event to the handler
            value={value}
            // TODO: Period and block has same id
            id={value}
          />
          <p>{value}</p>
        </Label>
      ))}
    </Section>
  );
};

export default FilterSection;

// styled components
const Section = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
`;
