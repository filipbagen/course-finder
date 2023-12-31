// imports
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import firebase from 'firebase/compat/app';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore'; // Make sure to import arrayUnion and updateDoc

// components
import CustomDropdownMenu from './CustomDropdownMenu';

const CourseBlock = ({ course, isListView, homeView }) => {
  const { currentUser } = useAuth();
  const db = firebase.firestore();
  const [dropdownItems, setDropdownItems] = useState([]);

  // functions
  // Use useMemo to memoize the menu items
  const homeDropdownItems = useMemo(
    () => [
      { label: 'Semester 7', action: () => handleAddToSemester('7') },
      { label: 'Semester 9', action: () => handleAddToSemester('9') },
      // ... other default items
    ],
    []
  ); // Empty dependency array means this only runs once

  const scheduleDropdownItems = useMemo(
    () => [
      { label: 'Open in Web', action: () => window.open(course.url) },
      { label: 'Delete Course', action: () => deleteCourse(course.kurskod) },
      // ... other items for the options div
    ],
    []
  ); // Empty dependency array means this only runs once

  const handleAddToSemester = async (semester) => {
    await addCourseToSchedule(semester);
  };

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

  useEffect(() => {
    if (homeView) {
      if (course.termin.includes('7') || course.termin.includes('9')) {
        setDropdownItems(homeDropdownItems);
      } else {
        setDropdownItems([]); // Or whatever the default should be when not 7 or 9
      }
    } else {
      setDropdownItems(scheduleDropdownItems); // Items for the 'options' trigger
    }
  }, [homeView, course.termin, homeDropdownItems, scheduleDropdownItems]);

  // functions
  // The addCourseToSchedule function takes a semester parameter
  const addCourseToSchedule = async (selectedSemester) => {
    if (!currentUser) {
      console.error('No user is signed in.');
      return;
    }

    // Ensure that selectedSemester is a string
    // If selectedSemester is an array, take the first element
    const semesterString = Array.isArray(selectedSemester)
      ? selectedSemester[0]
      : selectedSemester;

    try {
      // Reference to the user's document
      const userDocRef = doc(db, 'users', currentUser.uid);

      // Create an object with courseCode and semesterString
      const courseToAdd = {
        courseCode: course.kurskod,
        semester: semesterString, // Now it's guaranteed to be a string
      };

      // Update the 'courses' array field in the user's document
      await updateDoc(userDocRef, {
        courses: arrayUnion(courseToAdd),
      });

      console.log(`Course added to schedule for semester ${semesterString}!`);
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

  const getBackgroundColor = (area) => areaColors[area] || '#e99870'; // default color if area not found

  return (
    <Container style={{ width: isListView ? '100%' : 'auto' }}>
      <Content>
        <Test>
          <div>
            <h1>{course.kursnamn}</h1>
            <p>{course.kurskod}</p>
          </div>

          <Location>
            <Pin src="img/pin.svg" alt="Pin" />
            <p>{course.ort}</p>
          </Location>

          <div>
            <p>Block {course.block}</p>
            <p>{course.utbildningsniva}</p>
          </div>

          <Programs>
            {course.huvudomrade.length > 0 ? (
              course.huvudomrade.map((area) => (
                <Program
                  key={area}
                  style={{ backgroundColor: getBackgroundColor(area) }}
                >
                  {area}
                </Program>
              ))
            ) : (
              <Program>No program area</Program>
            )}
          </Programs>
        </Test>

        {homeView ? (
          course.termin.includes('7') || course.termin.includes('9') ? (
            <CustomDropdownMenu
              trigger={<Add src="img/add.svg" alt="Add Course" />}
              items={dropdownItems}
            />
          ) : (
            <Add
              onClick={() => handleAddToSemester(course.termin)}
              src="img/add.svg"
              alt="Add Course"
            />
          )
        ) : (
          <CustomDropdownMenu
            trigger={
              <div className="options">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            }
            items={dropdownItems}
          />
        )}
      </Content>
    </Container>
  );
};

export default CourseBlock;

// styled components
const Test = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const Container = styled.div`
  border-radius: 8px;
  background: var(--White, #fff);
  box-shadow: var(--box-shadow);

  min-width: 320px;
  width: 100%;
  flex: 1;

  /* position: relative;  */
  border-radius: 8px;
  background: var(--White, #fff);
  transition: background-color 0.2s; /* Smooth transition for background color */

  &:hover {
    background-color: #f0f0f0; /* Slightly darker color on hover */

    .options {
      display: flex; /* Show the three-dot menu on hover */
    }
  }
`;

const OptionsMenu = styled.div`
  display: none; /* Hide by default */
  cursor: pointer;
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 50px;
  padding: 20px 30px;
  height: 172px;
`;

const Pin = styled.img`
  width: 14px;
`;

const Location = styled.div`
  display: flex;
  gap: 6px;
`;

const Program = styled.p`
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
