import { useState } from 'react';
import DB from '../data/courses';
import CourseBlock from './components/CourseBlock';
import Filter from './components/Filter';

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
      {Object.entries(filterOptions).map(([filterType, options]) => (
        <Filter
          key={filterType}
          filterType={filterType}
          filterValues={options}
          handleFilterChange={handleFilterChange(filterType)}
        />
      ))}
      <ul>
        {filteredDB.map((course) => (
          <CourseBlock key={course.kurskod} course={course} />
        ))}
      </ul>
    </>
  );
};

export default App;
