// imports
import React from 'react';
import styled from 'styled-components';

// styled components
const Container = styled.div`
  display: flex;
  height: 188px;
  min-width: 320px;
  max-width: 100%;
  padding: 21px 29px;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1 0 0;
  border-radius: 8px;
  background: var(--White, #fff);
  box-shadow: var(--box-shadow);
`;

const Pin = styled.img`
  width: 14px;
`;

const Location = styled.div`
  display: flex;
  gap: 6px;
`;

const Program = styled.div`
  display: inline-flex;
  padding: 3px 8px;
  align-items: flex-start;
  gap: 10px;

  border-radius: 6px;
  background: ${(props) => props.background};
  color: var(--White, #fff);
`;

const Programs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const CourseBlock = ({ course }) => {
  const areaColors = {
    Medieteknik: '#E99870',
    Datateknik: '#A6C9E1',
    Datavetenskap: '#6A5ACD',
    Informationsteknologi: '#98FB98',
    'Tillämpad matematik': '#FFD700',
    'Industriell ekonomi': '#ff0095',
    Elektroteknik: '#3c1b2f',
    Matematik: '#b5ff14',
  };

  const getBackgroundColor = (area) => areaColors[area] || '#e99870'; // default color if area not found

  return (
    <Container>
      <div>
        <div>
          <h1>{course.kursnamn}</h1>
          <div>{course.kurskod}</div>
        </div>

        <Location>
          <Pin src="img/pin.svg" alt="Pin" />
          <div>{course.ort}</div>
        </Location>

        <div>
          <div>Block {course.block}</div>
          <div>{course.utbildningsniva}</div>
        </div>

        <Programs>
          {course.huvudomrade.map((area) => (
            <Program
              key={area}
              style={{ backgroundColor: getBackgroundColor(area) }}
            >
              {area}
            </Program>
          ))}
        </Programs>
      </div>

      <img src="img/add.svg" alt="" />
    </Container>
  );
};

export default CourseBlock;
