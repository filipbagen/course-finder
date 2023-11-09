import React from 'react';
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
`;

const CourseView = styled.div`
  display: flex;
  gap: 10px;
`;

const SortContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const SortSection = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const CourseList = ({ courses, setSortCriteria }) => {
  return (
    <>
      <SearchResults>
        <p>
          Showing: <strong>{Object.keys(courses).length}</strong> search results
        </p>

        <SortContainer>
          {/* <SortSection> */}
          <SortingOptions onSortCriteriaChange={setSortCriteria} />
          {/* </SortSection> */}

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
