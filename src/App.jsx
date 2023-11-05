import { useState } from 'react';
import DB from '../data/courses';
import CourseBlock from './components/CourseBlock';
import Filter from './components/Filter';
import styled from 'styled-components';

// styled
const Container = styled.div`
  display: flex;
  align-items: flex-start;
`;

const Courses = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
`;

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
`;

const App = () => {
  // Define all your filter types and their possible values
  const filterOptions = {
    termin: ['7', '8', '9'],
    period: ['1', '2'],
    block: ['1', '2', '3', '4'],
    utbildningsniva: ['Grundnivå', 'Avancerad nivå'],
    huvudomrade: ['Industriell ekonomi', 'Datavetenskap'],
    studietakt: ['Halvfart', 'Helfart'],
    ort: ['Norrköping', 'Linköping'],
    // ... add new filter types here
  };

  // Create a state object that will hold the selected values for each filter type
  const [selectedFilters, setSelectedFilters] = useState(
    Object.keys(filterOptions).reduce((acc, filterType) => {
      acc[filterType] = [];
      return acc;
    }, {})
  );

  const handleFilterChange = (filterType) => (event) => {
    const value = event.target.value;
    setSelectedFilters((currentFilters) => {
      const updatedFilters = currentFilters[filterType].includes(value)
        ? currentFilters[filterType].filter((item) => item !== value)
        : [...currentFilters[filterType], value];

      return { ...currentFilters, [filterType]: updatedFilters };
    });
  };

  // Filter logic that applies "OR" within the same category and "AND" across different categories
  const filteredDB = DB.filter((course) =>
    Object.entries(selectedFilters).every(
      ([filterType, filterValues]) =>
        filterValues.length === 0 ||
        filterValues.some((value) => course[filterType]?.includes(value))
    )
  );

  return (
    <>
      <Container>
        <FilterPanel>
          <Filter
            title="Semester"
            filterType="termin"
            filterValues={filterOptions.termin}
            handleFilterChange={handleFilterChange('termin')}
            selectedValues={selectedFilters.termin}
          />

          <Filter
            title="Period"
            filterType="period"
            filterValues={filterOptions.period}
            handleFilterChange={handleFilterChange('period')}
            selectedValues={selectedFilters.period}
          />

          <Filter
            title="Block"
            filterType="block"
            filterValues={filterOptions.block}
            handleFilterChange={handleFilterChange('block')}
            selectedValues={selectedFilters.block}
          />

          <Filter
            title="Level"
            filterType="utbildningsniva"
            filterValues={filterOptions.utbildningsniva}
            handleFilterChange={handleFilterChange('utbildningsniva')}
            selectedValues={selectedFilters.utbildningsniva}
          />

          <Filter
            title="Study Pace"
            filterType="studietakt"
            filterValues={filterOptions.studietakt}
            handleFilterChange={handleFilterChange('studietakt')}
            selectedValues={selectedFilters.studietakt}
          />

          <Filter
            title="Field of Study"
            filterType="huvudomrade"
            filterValues={filterOptions.huvudomrade}
            handleFilterChange={handleFilterChange('huvudomrade')}
            selectedValues={selectedFilters.huvudomrade}
          />

          <Filter
            title="Location"
            filterType="ort"
            filterValues={filterOptions.ort}
            handleFilterChange={handleFilterChange('ort')}
            selectedValues={selectedFilters.ort}
          />

          {/* <Filter
            title="Examination"
            filterType="examination"
            filterValues={filterOptions.examination}
            handleFilterChange={handleFilterChange('examination')}
            selectedValues={selectedFilters.examination}
          /> */}
        </FilterPanel>

        <Courses>
          {filteredDB.map((course) => (
            <CourseBlock key={course.kurskod} course={course} />
          ))}
        </Courses>
      </Container>
    </>
  );
};

export default App;
