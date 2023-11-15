import React from 'react';
import firebase from 'firebase/compat/app';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

// Components
import MainLayout from './MainLayout';

const Schedule = () => {
  const { currentUser } = useAuth();
  const db = firebase.firestore();
  const userID = currentUser.uid;

  db.collection('users')
    .doc(userID)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const coursesArray = userData.courses; // This is your array of courses
        console.log(coursesArray); // Log the array to the console
        // Do something with coursesArray, like setting state or processing data
      } else {
        console.log(`No document with ID '${userID}' found`);
      }
    })
    .catch((error) => {
      console.log('Error getting courses array: ', error);
    });

  return (
    <MainLayout>
      <div>
        <h1>Schedule</h1>
        <p>Here you can see your schedule</p>
      </div>
    </MainLayout>
  );
};

export default Schedule;

// style
