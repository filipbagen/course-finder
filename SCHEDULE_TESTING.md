# Schedule Testing Instructions

## 🧪 How to Test Schedule Functionality

The development server is running at `http://localhost:3000`. Navigate to the schedule page and follow these steps:

### 1. Open Browser Console

- Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
- Go to the Console tab

### 2. Run Automated Tests

```javascript
new ScheduleTester().runAllTests();
```

This will test:

- ✅ Toast notifications
- ✅ API connectivity
- ✅ Schedule data structure
- ✅ Drag & drop setup

### 3. Manual Testing

#### Test Drag & Drop:

1. Find a course in Semester 7 or 9
2. Drag it to the other semester (7↔9)
3. Verify it moves visually
4. Check if a success toast appears
5. Refresh the page to verify persistence

#### Test Course Deletion:

1. Find any course card
2. Click the trash icon (🗑️)
3. Verify the course disappears
4. Check if a success toast appears
5. Refresh the page to verify it's gone from database

#### Test Error Handling:

1. Try dragging a Semester 8 course (should not move)
2. Try invalid operations
3. Verify error toasts appear

### 4. Advanced Testing

#### Test Specific Operations:

```javascript
const tester = new ScheduleTester();

// Test moving a specific course
await tester.testCourseMove('course-id-here', 7, 9);

// Test deleting a specific enrollment
await tester.testCourseDelete('enrollment-id-here');
```

### 5. Expected Results

✅ **Success Indicators:**

- Toast notifications appear for all operations
- Courses move between semesters 7↔9
- Courses disappear when deleted
- Changes persist after page refresh
- No console errors

❌ **Failure Indicators:**

- No toast notifications
- Visual changes don't persist on refresh
- Console errors
- Operations fail silently

### 6. Troubleshooting

If tests fail:

1. Check browser console for errors
2. Verify you're logged in
3. Check network tab for failed API calls
4. Ensure database is running
5. Check Supabase connection

### 7. Test Data

You can find course and enrollment IDs by:

1. Opening browser dev tools
2. Going to Network tab
3. Loading the schedule page
4. Finding the `/api/schedule` request
5. Looking at the response data
