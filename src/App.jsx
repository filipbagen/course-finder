import React, { useState } from 'react';
import styled from 'styled-components';

// data
import DB from '../data/courses';

// function
import sortCourses from './functions/sortCourses';

// components
import CourseList from './components/CourseList';
import filterCourses from './components/filterCourses';
import SearchComponent from './components/SearchComponent';
import FilterPanelComponent from './components/FilterPanelComponent';

// styled
const Container = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 38px;
  width: 100vw;
`;

const SearchCourseSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 38px;
  width: 100%;
`;

const Test = styled.div`
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 0;
`;

const App = () => {
  // state
  const [searchString, setSearchString] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({}); // assume initial state is set
  const [sortCriteria, setSortCriteria] = useState('Alphabetical'); // default sorting criteria

  // ... Assume all the handler functions and other logic are here
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

  // This method would update the searchString state
  const handleSearchChange = (event) => {
    setSearchString(event.target.value);
  };

  // This method would update the selectedFilters state
  const handleFilterChange = (filterType) => (event) => {
    const value = event.target.value;
    const checked = event.target.checked; // boolean that tells if the checkbox was checked or unchecked

    // Update the selectedFilters state based on whether the box was checked or unchecked
    setSelectedFilters((prevFilters) => {
      // Get the current array of filter values, or an empty array if none
      const currentFilterValues = prevFilters[filterType] || [];

      if (checked) {
        // If the checkbox was checked, add the value to the array
        return {
          ...prevFilters,
          [filterType]: [...currentFilterValues, value],
        };
      } else {
        // If the checkbox was unchecked, remove the value from the array
        return {
          ...prevFilters,
          [filterType]: currentFilterValues.filter((item) => item !== value),
        };
      }
    });
  };

  // Assume this method filters the DB based on searchString and selectedFilters
  const filteredCourses = filterCourses(DB, searchString, selectedFilters);
  const sortedCourses = sortCourses(filteredCourses, sortCriteria);

  return (
    <>
      <Container>
        <Test>
          <FilterPanelComponent
            filterOptions={filterOptions}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />
        </Test>

        <SearchCourseSection>
          <SearchComponent onSearchChange={handleSearchChange} />
          <CourseList
            courses={filteredCourses && sortedCourses}
            sortCriteria={sortCriteria}
            setSortCriteria={setSortCriteria}
          />
        </SearchCourseSection>
      </Container>
    </>
  );
};

export default App;
