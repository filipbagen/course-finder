import React from 'react';
import styled from 'styled-components';

// components
import CourseBlock from './CourseBlock';
import SortingOptions from './SortingOptions';

const Courses = styled.div`
  display: flex;
  gap: 18px;
  width: 100%;

  background-color: blue;
`;

const SearchResults = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0;
`;

const ViewOptions = styled.div`
  display: flex;
  gap: 16px;

  img {
    transition: 0.2s;
  }
`;

const SortContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

import { useState } from 'react';

const CourseList = ({ courses, setSortCriteria }) => {
  const [isListView, setIsListView] = useState(false);

  const handleListViewClick = () => {
    setIsListView(true);
  };

  const handleGridViewClick = () => {
    setIsListView(false);
  };

  return (
    <>
      <SearchResults>
        <p>
          Showing: <strong>{Object.keys(courses).length}</strong> search results
        </p>

        <SortContainer>
          <SortingOptions onSortCriteriaChange={setSortCriteria} />

          <ViewOptions>
            <img
              src="img/list_view.svg"
              alt=""
              onClick={handleListViewClick}
              style={{
                filter: isListView ? 'brightness(0.5)' : 'brightness(1)',
                cursor: 'pointer',
              }}
            />
            <img
              src="img/grid_view.svg"
              alt=""
              onClick={handleGridViewClick}
              style={{
                filter: !isListView ? 'brightness(0.5)' : 'brightness(1)',
                cursor: 'pointer',
              }}
            />
          </ViewOptions>
        </SortContainer>
      </SearchResults>

      <Courses
        style={{
          flexDirection: isListView ? 'column' : 'row',
          flexWrap: isListView ? 'nowrap' : 'wrap',
        }}
      >
        {courses.map((course) => (
          <CourseBlock
            isListView={isListView}
            key={course.kurskod}
            course={course}
          />
        ))}
      </Courses>
    </>
  );
};

export default CourseList;
