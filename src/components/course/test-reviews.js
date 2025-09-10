// Manual Test Script for CourseReviews Component
// Run this in the browser console to test the review functionality

// Test 1: Check if reviews API endpoint works
async function testReviewsAPI() {
  console.log('🧪 Testing Reviews API...');

  try {
    const courseId = '1637fd81-da54-7901-3dd5-27e046a90048'; // Use a real course ID from your database
    const response = await fetch(`/api/courses/${courseId}/reviews`);
    const result = await response.json();

    console.log('API Response:', result);

    if (response.ok && result.success) {
      console.log('✅ API call successful');
      console.log('📊 Reviews found:', result.data.reviews.length);
      console.log('⭐ Average rating:', result.data.averageRating);
      return result.data;
    } else {
      console.error('❌ API call failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// Test 2: Check if review submission works
async function testReviewSubmission() {
  console.log('🧪 Testing Review Submission...');

  try {
    const testReview = {
      rating: 4.5,
      comment: 'Test review from manual testing',
      courseId: '1637fd81-da54-7901-3dd5-27e046a90048',
    };

    const response = await fetch('/api/courses/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testReview),
    });

    const result = await response.json();
    console.log('Submission Response:', result);

    if (response.ok && result.success) {
      console.log('✅ Review submission successful');
      return result.data;
    } else {
      console.error('❌ Review submission failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// Test 3: Check if review deletion works
async function testReviewDeletion() {
  console.log('🧪 Testing Review Deletion...');

  try {
    // First get reviews to find one to delete
    const reviewsData = await testReviewsAPI();
    if (!reviewsData || reviewsData.reviews.length === 0) {
      console.log('⚠️ No reviews found to delete');
      return;
    }

    const reviewToDelete = reviewsData.reviews[0];
    console.log('Deleting review:', reviewToDelete.id);

    const response = await fetch(
      `/api/courses/review?reviewId=${reviewToDelete.id}`,
      {
        method: 'DELETE',
      }
    );

    const result = await response.json();
    console.log('Deletion Response:', result);

    if (response.ok && result.success) {
      console.log('✅ Review deletion successful');
      return true;
    } else {
      console.error('❌ Review deletion failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

// Test 4: Check for infinite requests
function testInfiniteRequests() {
  console.log('🧪 Testing for Infinite Requests...');

  // Monitor network requests
  let requestCount = 0;
  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    requestCount++;
    console.log(`📡 Request #${requestCount}:`, args[0]);

    if (requestCount > 10) {
      console.error('❌ Potential infinite request loop detected!');
      return Promise.reject(new Error('Too many requests'));
    }

    return originalFetch.apply(this, args);
  };

  // Reset after 5 seconds
  setTimeout(() => {
    window.fetch = originalFetch;
    console.log(`📊 Total requests made: ${requestCount}`);
    if (requestCount <= 5) {
      console.log('✅ Request count looks normal');
    } else {
      console.warn('⚠️ High request count detected');
    }
  }, 5000);
}

// Test 5: Check component rendering
function testComponentRendering() {
  console.log('🧪 Testing Component Rendering...');

  // Check if CourseReviews component exists
  const courseReviewsElements = document.querySelectorAll(
    '[data-testid="course-reviews"]'
  );
  console.log('CourseReviews components found:', courseReviewsElements.length);

  // Check if review forms exist
  const reviewForms = document.querySelectorAll('form');
  console.log('Review forms found:', reviewForms.length);

  // Check if star ratings exist
  const starRatings = document.querySelectorAll('[data-testid="star-rating"]');
  console.log('Star ratings found:', starRatings.length);

  return {
    courseReviewsCount: courseReviewsElements.length,
    reviewFormsCount: reviewForms.length,
    starRatingsCount: starRatings.length,
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting CourseReviews Tests...\n');

  // Test 1: API functionality
  console.log('1️⃣ Testing API Endpoints...');
  await testReviewsAPI();
  console.log('');

  // Test 2: Submission
  console.log('2️⃣ Testing Review Submission...');
  await testReviewSubmission();
  console.log('');

  // Test 3: Deletion
  console.log('3️⃣ Testing Review Deletion...');
  await testReviewDeletion();
  console.log('');

  // Test 4: Infinite requests
  console.log('4️⃣ Testing for Infinite Requests...');
  testInfiniteRequests();
  console.log('');

  // Test 5: Component rendering
  console.log('5️⃣ Testing Component Rendering...');
  const renderResults = testComponentRendering();
  console.log('Render results:', renderResults);
  console.log('');

  console.log('✅ All tests completed!');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runCourseReviewsTests = runAllTests;
  window.testReviewsAPI = testReviewsAPI;
  window.testReviewSubmission = testReviewSubmission;
  window.testReviewDeletion = testReviewDeletion;
  window.testInfiniteRequests = testInfiniteRequests;
  window.testComponentRendering = testComponentRendering;

  console.log('🎯 CourseReviews Test Functions Available:');
  console.log('- runCourseReviewsTests() - Run all tests');
  console.log('- testReviewsAPI() - Test API endpoint');
  console.log('- testReviewSubmission() - Test review submission');
  console.log('- testReviewDeletion() - Test review deletion');
  console.log('- testInfiniteRequests() - Monitor for infinite requests');
  console.log('- testComponentRendering() - Check component rendering');
}

export {
  runAllTests,
  testReviewsAPI,
  testReviewSubmission,
  testReviewDeletion,
  testInfiniteRequests,
  testComponentRendering,
};
