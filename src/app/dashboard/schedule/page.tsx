'use client';

import { useEffect, useState } from 'react';

export default function Schedule() {
  const [courses, setCourses] = useState<any[]>([]);

  const getCourses = async () => {
    const response = await fetch('/api/enrollment');

    if (!response.ok) {
      console.error('Error:', response.status);
      throw new Error('Error getting courses');
    }

    const data = await response.json();
    setCourses(data.courses);
  };

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-8">
        <h5>Period 1</h5>

        <div className="flex justify-between">
          <div className="flex flex-col gap-4 w-64">
            <h6>Termin 7</h6>
            <div className="bg-red-200">
              <p>Render courses here</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-64">
            <h6>Termin 8</h6>
            <div className="bg-red-200">
              <p>Render courses here</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-64">
            <h6>Termin 9</h6>
            <div className="bg-red-200">
              <p>Render courses here</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <h5>Period 2</h5>

        <div className="flex justify-between">
          <div className="flex flex-col gap-4 w-64">
            <h6>Termin 7</h6>
            <div className="bg-red-200">
              <p>Render courses here</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-64">
            <h6>Termin 8</h6>
            <div className="bg-red-200">
              <p>Render courses here</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-64">
            <h6>Termin 9</h6>
            <div className="bg-red-200">
              <p>Render courses here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
