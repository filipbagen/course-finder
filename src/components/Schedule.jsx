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

  const handleCourseDelete = (deletedCourseCode) => {
    setCoursesArray((prevCourses) =>
      prevCourses.filter((course) => course.courseCode !== deletedCourseCode)
    );
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

  return (
    <MainLayout>
      <div>
        <h1>Schedule</h1>
        <p>Here you can see your schedule</p>

        <Container>
          <Column>
            <h2>Semester 7</h2>
            <p>Period 1</p>
            {coursesArray.map((course) => {
              // Get the full course details from your local database
              const fullCourseDetails = getCourseDetails(course.courseCode);
              fullCourseDetails.termin = course.semester;

              // Check if the course details exist and the conditions are met
              if (
                fullCourseDetails &&
                fullCourseDetails.termin === '7' &&
                fullCourseDetails.period.includes('1')
              ) {
                return (
                  <CourseBlock
                    key={course.courseCode}
                    course={fullCourseDetails}
                    isListView={false}
                    onDeleteCourse={() => handleCourseDelete(course.courseCode)}
                  />
                );
              }
              return null; // If details are not found or conditions are not met, render nothing
            })}

            <p>Period 2</p>
            {coursesArray.map((course) => {
              // Get the full course details from your local database
              const fullCourseDetails = getCourseDetails(course.courseCode);
              fullCourseDetails.termin = course.semester;

              // Check if the course details exist and the conditions are met
              if (
                fullCourseDetails &&
                fullCourseDetails.termin === '7' &&
                fullCourseDetails.period.includes('2')
              ) {
                return (
                  <CourseBlock
                    key={course.courseCode}
                    course={fullCourseDetails}
                    isListView={false}
                    onDeleteCourse={() => handleCourseDelete(course.courseCode)}
                  />
                );
              }
              return null; // If details are not found or conditions are not met, render nothing
            })}
          </Column>

          <Column>
            <h2>Semester 8</h2>
            <p>Period 1</p>
            {coursesArray.map((course) => {
              // Get the full course details from your local database
              const fullCourseDetails = getCourseDetails(course.courseCode);
              fullCourseDetails.termin = course.semester;

              // Check if the course details exist and the conditions are met
              if (
                fullCourseDetails &&
                fullCourseDetails.termin === '8' &&
                fullCourseDetails.period.includes('1')
              ) {
                return (
                  <CourseBlock
                    key={course.courseCode}
                    course={fullCourseDetails}
                    isListView={false}
                    onDeleteCourse={() => handleCourseDelete(course.courseCode)}
                  />
                );
              }
              return null; // If details are not found or conditions are not met, render nothing
            })}

            <p>Period 2</p>
            {coursesArray.map((course) => {
              // Get the full course details from your local database
              const fullCourseDetails = getCourseDetails(course.courseCode);
              fullCourseDetails.termin = course.semester;

              // Check if the course details exist and the conditions are met
              if (
                fullCourseDetails &&
                fullCourseDetails.termin === '8' &&
                fullCourseDetails.period.includes('2')
              ) {
                return (
                  <CourseBlock
                    key={course.courseCode}
                    course={fullCourseDetails}
                    isListView={false}
                    onDeleteCourse={() => handleCourseDelete(course.courseCode)}
                  />
                );
              }
              return null; // If details are not found or conditions are not met, render nothing
            })}
          </Column>

          <Column>
            <h2>Semester 9</h2>
            <p>Period 1</p>
            {coursesArray.map((course) => {
              // Get the full course details from your local database
              const fullCourseDetails = getCourseDetails(course.courseCode);
              fullCourseDetails.termin = course.semester;

              // Check if the course details exist and the conditions are met
              if (
                fullCourseDetails &&
                fullCourseDetails.termin === '9' &&
                fullCourseDetails.period.includes('1')
              ) {
                return (
                  <CourseBlock
                    key={course.courseCode}
                    course={fullCourseDetails}
                    isListView={false}
                    onDeleteCourse={() => handleCourseDelete(course.courseCode)}
                  />
                );
              }
              return null; // If details are not found or conditions are not met, render nothing
            })}

            <p>Period 2</p>
            {coursesArray.map((course) => {
              // Get the full course details from your local database
              const fullCourseDetails = getCourseDetails(course.courseCode);
              fullCourseDetails.termin = course.semester;

              // Check if the course details exist and the conditions are met
              if (
                fullCourseDetails &&
                fullCourseDetails.termin === '9' &&
                fullCourseDetails.period.includes('2')
              ) {
                return (
                  <CourseBlock
                    key={course.courseCode}
                    course={fullCourseDetails}
                    isListView={false}
                    onDeleteCourse={() => handleCourseDelete(course.courseCode)}
                  />
                );
              }
              return null; // If details are not found or conditions are not met, render nothing
            })}
          </Column>
        </Container>
      </div>
    </MainLayout>
  );
};

export default Schedule;

// style
const Column = styled.div`
  display: flex;
  padding: 25px 30px;
  flex-direction: column;
  align-items: flex-start;
  gap: 46px;
  background-color: #fff3f3;
  border-radius: 8px;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 28px;
`;
