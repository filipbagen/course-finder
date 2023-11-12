import React from 'react';
import styled from 'styled-components';

const FilterSection = ({ title, filterValues, handleFilterChange }) => {
  return (
    <Section>
      {title && <Title>{title}</Title>}

      {filterValues.map((value) => (
        <Label key={value} htmlFor={value}>
          <input
            type="checkbox"
            onChange={(event) => handleFilterChange(event)} // Pass the event to the handler
            value={value}
            id={value}
          />
          <span>{value}</span>
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
  gap: 8px;
`;

const Title = styled.h3`
  margin: 0;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
`;
