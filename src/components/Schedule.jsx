import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

// Components
import MainLayout from './MainLayout';

const Schedule = () => {
  const { currentUser } = useAuth();
  const db = firebase.firestore();
  const userID = currentUser.uid;

  const [coursesArray, setCoursesArray] = useState([]);

  useEffect(() => {
    db.collection('users')
      .doc(userID)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          setCoursesArray(userData.courses); // Update state with the courses array
        } else {
          console.log(`No document with ID '${userID}' found`);
        }
      })
      .catch((error) => {
        console.log('Error getting courses array: ', error);
      });
  }, [userID, db]);

  return (
    <MainLayout>
      <div>
        <h1>Schedule</h1>
        <p>Here you can see your schedule</p>
        {/* Render your courses here using coursesArray */}
        {coursesArray.map((course) => (
          <div key={course}>
            <p>{course}</p>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default Schedule;
