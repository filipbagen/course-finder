const sortCourses = (courses, sortCriteria) => {
  // Make a shallow copy of the courses array to sort
  let sortedCourses = [...courses];

  switch (sortCriteria) {
    case 'Alphabetical':
      sortedCourses.sort((a, b) => a.kursnamn.localeCompare(b.kursnamn));
      break;

    case 'ReverseAlphabetical':
      sortedCourses.sort((a, b) => b.kursnamn.localeCompare(a.kursnamn));
      break;

    case 'Course Coode':
      sortedCourses.sort((a, b) => a.kurskod.localeCompare(b.kurskod));
      break;

    case 'Course Code Reverse':
      sortedCourses.sort((a, b) => b.kurskod.localeCompare(a.kurskod));
      break;

    default:
      break;
  }

  return sortedCourses;
};

export default sortCourses;
