import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

// Components
import MainLayout from './MainLayout';
import CourseBlock from './CourseBlock';

// data
import data from '../../data/courses';

const Schedule = () => {
  const { currentUser } = useAuth();
  const [coursesArray, setCoursesArray] = useState([]);
  const db = firebase.firestore();
  const userID = currentUser.uid;

  // functions
  const getCourseDetails = (code) => {
    return data.find((course) => course.kurskod === code);
  };

  useEffect(() => {
    const unsubscribe = db
      .collection('users')
      .doc(userID)
      .onSnapshot(
        (docSnapshot) => {
          if (docSnapshot.exists) {
            const userData = docSnapshot.data();
            setCoursesArray(userData.courses || []);
          } else {
            console.log('No such document!');
          }
        },
        (error) => {
          console.error('Error listening to the document: ', error);
        }
      );

    // Detach the listener when the component is unmounted
    return unsubscribe;
  }, [userID, db]);

  // A function to render the course blocks for a given semester and period
  const renderCourseBlocks = (semester, period) => {
    return coursesArray
      .map((course) => {
        const fullCourseDetails = getCourseDetails(course.courseCode);
        if (!fullCourseDetails) return null; // Early return if details are not found

        fullCourseDetails.termin = course.semester; // Set the correct semester

        // Check if the course matches the semester and period
        if (
          fullCourseDetails.termin === semester &&
          fullCourseDetails.period.includes(period)
        ) {
          return (
            <CourseBlock
              key={course.courseCode}
              course={fullCourseDetails}
              isListView={true}
              homeView={false}
            />
          );
        }
        return null;
      })
      .filter(Boolean); // Filter out null values
  };

  return (
    <MainLayout>
      <Test>
        <h1>Schedule</h1>
        <p>Here you can see your schedule</p>

        <Container>
          {['7', '8', '9'].map((semester) => (
            <Column key={semester}>
              <h2>Semester {semester}</h2>
              {['1', '2'].map((period) => (
                <React.Fragment key={period}>
                  <p>Period {period}</p>
                  {renderCourseBlocks(semester, period)}
                </React.Fragment>
              ))}
            </Column>
          ))}
        </Container>
      </Test>
    </MainLayout>
  );
};

export default Schedule;

// style
const Container = styled.div`
  /* display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 28px; */

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
`;

const Test = styled.div`
  width: 100%;
`;

const Column = styled.div`
  display: flex;
  padding: 25px 30px;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  background-color: #fff3f3;
  border-radius: 8px;
  /* width: 300px; */
`;
