// import
import React from 'react';
import CourseBlock from './components/CourseBlock';
import styled from 'styled-components';

// data
import courses from '../data/courses';

// styled components
const CourseContainer = styled.div`
  display: flex;
  max-width: 1080px;
  align-items: flex-start;
  align-content: flex-start;
  gap: 18px;
  flex-wrap: wrap;
`;

function App() {
  return (
    <>
      <CourseContainer>
        {courses.map((course) => (
          <CourseBlock course={course} key={course.kurskod} />
        ))}
      </CourseContainer>
    </>
  );
}

export default App;
