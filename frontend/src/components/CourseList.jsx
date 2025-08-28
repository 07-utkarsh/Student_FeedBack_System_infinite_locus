import React from 'react';
import CourseCard from './CourseCard';
import './CourseList.css';

const CourseList = ({ courses, onCourseSelect, loading }) => {
  if (loading) {
    return (
      <div className="courses-container">
        <h2>Available Courses</h2>
        <div className="courses-grid">
          <div className="course-card skeleton" style={{ height: '200px' }}>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
          </div>
          <div className="course-card skeleton" style={{ height: '200px' }}>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
          </div>
          <div className="course-card skeleton" style={{ height: '200px' }}>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
          </div>
          <div className="course-card skeleton" style={{ height: '200px' }}>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="courses-container">
        <h2>Available Courses</h2>
        <div className="empty-state animate-fade-in-up">
          <h3>No courses available</h3>
          <p>Courses will appear here once they are added by an administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      <p className="courses-description">
        Click on any course to view all feedback and add your own review.
      </p>
      <div className="courses-grid">
        {courses.map((course, index) => (
          <CourseCard 
            key={course._id} 
            course={course} 
            onSelect={() => onCourseSelect(course)} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseList;
