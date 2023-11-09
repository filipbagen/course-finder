import React, { useState } from 'react';
import styled from 'styled-components';

// data
import DB from '../data/courses';

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

/**

const App = () => {
  // NEW
  const matchText = (course) => {
    const text = searchString.toLowerCase();
    // Add any other course properties you want to search within
    return (
      course.kursnamn.toLowerCase().includes(text) ||
      course.kurskod.toLowerCase().includes(text)
    );
  };

  // NEW
  const [searchString, setSearchString] = useState('');

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

  // NEW
  const TextInput = (event) => {
    setSearchString(event.target.value);
  };

  // NEW
  const getFilteredCourses = () => {
    // First apply the filters from the filter panel
    const coursesAfterFilter = DB.filter((course) =>
      Object.entries(selectedFilters).every(
        ([filterType, filterValues]) =>
          filterValues.length === 0 ||
          filterValues.some((value) => course[filterType]?.includes(value))
      )
    );

    // Then apply the text search on the results of the filters
    // NEW
    return searchString
      ? coursesAfterFilter.filter(matchText)
      : coursesAfterFilter;
  };

  // Call getFilteredCourses() to get the final list of courses to display
  const filteredCourses = getFilteredCourses();

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

        </FilterPanel>

        <InputDiv>
          <Input onChange={TextInput} placeholder="Search course..." />
        </InputDiv>

        <Courses>
          {filteredCourses.map((course) => (
            <CourseBlock key={course.kurskod} course={course} />
          ))}
        </Courses>
      </Container>
    </>
  );
};

export default App;

*/

const App = () => {
  const [searchString, setSearchString] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({}); // assume initial state is set

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
          <CourseList courses={filteredCourses} />
        </SearchCourseSection>
      </Container>
    </>
  );
};

export default App;
