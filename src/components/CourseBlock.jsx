// imports
import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import firebase from 'firebase/compat/app';
import {
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
} from 'firebase/firestore'; // Make sure to import arrayUnion and updateDoc

const CourseBlock = ({ course, isListView, onDeleteCourse }) => {
  const { currentUser } = useAuth();
  const db = firebase.firestore();

  // State to hold the selected semester
  const [selectedSemester, setSelectedSemester] = useState('7');

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

  // functions
  const addCourseToSchedule = async () => {
    if (!currentUser) {
      console.error('No user is signed in.');
      return;
    }

    try {
      // Reference to the user's document
      const userDocRef = doc(db, 'users', currentUser.uid);

      // Create an object with courseCode and semester
      const courseToAdd = {
        courseCode: course.kurskod,
        semester: selectedSemester,
      };

      // Update the 'courses' array field in the user's document
      await updateDoc(userDocRef, {
        courses: arrayUnion(courseToAdd),
      });

      console.log('Course added to schedule!');
    } catch (error) {
      console.error('Error adding course to schedule: ', error);
    }
  };

  const deleteCourse = async (courseCodeToDelete) => {
    if (!currentUser) {
      console.error('No user is signed in.');
      return;
    }

    try {
      // Reference to the user's document
      const userDocRef = doc(db, 'users', currentUser.uid);

      // Fetch the current document to get the latest courses array
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        // Get the current courses array from the document
        let courses = docSnap.data().courses;

        // Filter out the course with the matching courseCode
        courses = courses.filter(
          (course) => course.courseCode !== courseCodeToDelete
        );

        // Update the 'courses' array field in the user's document
        await updateDoc(userDocRef, { courses });

        // Call any local state updates or other cleanup here
        console.log('Course removed from schedule!');
      } else {
        console.error('User document does not exist!');
      }
    } catch (error) {
      console.error('Error removing course from schedule: ', error);
    }
  };

  // // Function to handle semester selection change
  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const getBackgroundColor = (area) => areaColors[area] || '#e99870'; // default color if area not found

  return (
    <Container style={{ width: isListView ? '100%' : 'auto' }}>
      <Content>
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

          {/* Radio buttons for semester selection */}
          {course.termin.includes('7') || course.termin.includes('9') ? (
            <div>
              <label>
                <input
                  type="radio"
                  value="7"
                  checked={selectedSemester === '7'}
                  onChange={handleSemesterChange}
                />
                Semester 7
              </label>
              <label>
                <input
                  type="radio"
                  value="9"
                  checked={selectedSemester === '9'}
                  onChange={handleSemesterChange}
                />
                Semester 9
              </label>
            </div>
          ) : null}
        </div>

        <Add onClick={addCourseToSchedule} src="img/add.svg" alt="Add Course" />
        <Delete onClick={() => deleteCourse(course.kurskod)}>X</Delete>
      </Content>
    </Container>
  );
};

export default CourseBlock;

// styled components
const Container = styled.div`
  border-radius: 8px;
  background: var(--White, #fff);
  box-shadow: var(--box-shadow);

  min-width: 320px;
  width: 100%;
  flex: 1;
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 21px 29px;
  height: 188px;
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

const Add = styled.img`
  cursor: pointer;
`;

const Delete = styled.div`
  cursor: pointer;
  height: 20px;
  width: 20px;
  border-radius: 100%;
  background-color: red;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: white;
`;
