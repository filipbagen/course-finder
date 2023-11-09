import React from 'react';
import styled from 'styled-components';

// components
import CourseBlock from './CourseBlock';

const Courses = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  align-content: flex-start;
  gap: 18px;
  flex-wrap: wrap;
`;

const SearchResults = styled.div`
  margin: 0;
`;

const CourseList = ({ courses }) => {
  console.log(typeof courses);

  return (
    <>
      <SearchResults>
        Showing: <strong>{Object.keys(courses).length}</strong> search results
      </SearchResults>

      <Courses>
        {courses.map((course) => (
          <CourseBlock key={course.kurskod} course={course} />
        ))}
      </Courses>
    </>
  );
};

export default CourseList;
