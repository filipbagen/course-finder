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

        {/* <Container>
          {Object.entries(groupedCourses).map(([key, courses]) => (
            <Column key={key}>
              <h2>{key.split(' - ')[0]}</h2>
              <p>{key.split(' - ')[1]}</p>

              {courses.map((course) => (
                <CourseBlock
                  key={course.kurskod}
                  course={course}
                  isListView={false}
                />
              ))}
            </Column>
          ))}
        </Container> */}

        <Container>
          <Column>
            <h2>Semester 1</h2>
            <p>Period 1</p>
            {/* {coursesArray.map((course) => (
              <CourseBlock
                key={course}
                course={getCourseDetails(course)}
                isListView={false}
              />
            ))} */}

            <p>Period 2</p>
            {/* {coursesArray.map((course) => (
              <CourseBlock
                key={course}
                course={getCourseDetails(course)}
                isListView={false}
              />
            ))} */}
          </Column>

          <Column>
            <h2>Semester 2</h2>
            <p>Period 1</p>
            {coursesArray.map((course) => (
              <CourseBlock
                key={course.courseCode}
                course={getCourseDetails(course.courseCode)}
                isListView={false}
                onDeleteCourse={() => handleCourseDelete(course.courseCode)}
              />
            ))}

            <p>Period 2</p>
            {/* {coursesArray.map((course) => (
              <CourseBlock
                key={course}
                course={getCourseDetails(course)}
                isListView={false}
              />
            ))} */}
          </Column>

          <Column>
            <h2>Semester 3</h2>
            <p>Period 1</p>
            {/* {coursesArray.map((course) => (
              <CourseBlock
                key={course}
                course={getCourseDetails(course)}
                isListView={false}
              />
            ))} */}

            <p>Period 2</p>
            {/* {coursesArray.map((course) => (
              <CourseBlock
                key={course}
                course={getCourseDetails(course)}
                isListView={false}
              />
            ))} */}
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
