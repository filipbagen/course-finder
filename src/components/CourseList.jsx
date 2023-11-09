import React from 'react';
import styled from 'styled-components';
import CourseBlock from './CourseBlock';

const Courses = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
`;

const CourseList = ({ courses }) => {
  // courses.forEach((course) => {
  //   console.log(course.termin); // Do this for each property
  // });

  return (
    <Courses>
      {courses.map((course) => (
        <CourseBlock key={course.kurskod} course={course} />
      ))}
    </Courses>
  );
};

export default CourseList;
