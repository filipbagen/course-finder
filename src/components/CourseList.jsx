import React, { useState } from 'react';
import styled from 'styled-components';

// components
import CourseBlock from './CourseBlock';
import SortingOptions from './SortingOptions';

const Courses = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  align-content: flex-start;
  gap: 18px;
  flex-wrap: wrap;
`;

const SearchResults = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0;

  background-color: red;
`;

const CourseView = styled.div`
  display: flex;
  gap: 10px;
`;

const SortContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const CourseList = ({ courses }) => {
  const [sortCriteria, setSortCriteria] = useState('Alphabetical'); // default sorting criteria

  return (
    <>
      <SearchResults>
        <p>
          Showing: <strong>{Object.keys(courses).length}</strong> search results
        </p>

        <SortContainer>
          <div>
            <p>Sort by:</p>
            {/* <SortingOptions onSortCriteriaChange={setSortCriteria} /> */}
          </div>

          <CourseView>
            <img src="public/img/list_view.svg" alt="" />
            <img src="public/img/grid_view.svg" alt="" />
          </CourseView>
        </SortContainer>
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
