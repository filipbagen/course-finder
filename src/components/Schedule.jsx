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
  const db = firebase.firestore();
  const userID = currentUser.uid;

  // functions
  const getCourseDetails = (code) => {
    return data.find((course) => course.kurskod === code);
  };

  const handleCourseDelete = (deletedCourseCode) => {
    setCoursesArray((prevCourses) =>
      prevCourses.filter((course) => course !== deletedCourseCode)
    );
  };

  const [coursesArray, setCoursesArray] = useState([]);

  useEffect(() => {
    // Define an async function to fetch data
    const fetchData = async () => {
      try {
        // Get the user document
        const userDoc = await db.collection('users').doc(userID).get();

        // Check if the document exists
        if (userDoc.exists) {
          // Extract the courses array from the document data
          const userData = userDoc.data();
          const courses = userData.courses || []; // Default to empty array if courses is not present

          // Update the state with the courses data
          setCoursesArray(courses);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };

    // Call the fetchData function
    fetchData();
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
                key={course}
                course={getCourseDetails(course)}
                isListView={false}
                onDeleteCourse={handleCourseDelete}
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
