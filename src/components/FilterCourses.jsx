const filterCourses = (courses, searchString, selectedFilters) => {
  const searchLower = searchString.toLowerCase();

  return courses.filter((course) => {
    // Search filter: checks if the course name or code includes the search string
    const matchesSearch =
      course.kursnamn.toLowerCase().includes(searchLower) ||
      course.kurskod.toLowerCase().includes(searchLower);

    // Filter for each filter type (e.g., semester, level)
    const matchesFilters = Object.keys(selectedFilters).every((filterType) => {
      // If no filter is set for this type, consider it a match
      if (!selectedFilters[filterType].length) {
        return true;
      }

      // If the course's attribute matches any of the selected filter values, it's a match
      return selectedFilters[filterType].some((selectedValue) =>
        course[filterType].includes(selectedValue)
      );
    });

    // Only include courses that match search and all filters
    return matchesSearch && matchesFilters;
  });
};

export default filterCourses;
