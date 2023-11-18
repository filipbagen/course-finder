import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// components
import CourseBlock from './CourseBlock';
import SortingOptions from './SortingOptions';

const CourseList = ({ courses, setSortCriteria }) => {
  const [isListView, setIsListView] = useState(window.innerWidth <= 960);

  useEffect(() => {
    const handleResize = () => {
      setIsListView(window.innerWidth <= 960); // Update based on window width
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Automatically switch to list view if 1 or fewer courses
    setIsListView(courses.length <= 1);
  }, [courses]);

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
        className="courses"
        style={{
          flexDirection: isListView ? 'column' : 'row',
          flexWrap: isListView ? 'nowrap' : 'wrap',
        }}
      >
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseBlock
              isListView={isListView}
              key={course.kurskod}
              course={course}
            />
          ))
        ) : (
          <div>No courses found.</div>
        )}
      </Courses>
    </>
  );
};

export default CourseList;

// style
const Courses = styled.div`
  display: flex;
  gap: 18px;
`;

const SearchResults = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
