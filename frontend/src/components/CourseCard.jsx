import React from 'react';

const CourseCard = ({ course, onSelect, index = 0 }) => {
  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span 
        key={star} 
        className={`star ${star <= rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div 
      className={`course-card animate-scale-in`} 
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onSelect}
    >
      <div className="course-header">
        <h3 className="course-name">{course.name}</h3>
        <span className="course-code">{course.code}</span>
      </div>
      
      <div className="course-info">
        <p className="course-instructor">Instructor: {course.instructor}</p>
        {course.description && (
          <p className="course-description">{course.description}</p>
        )}
      </div>
      
      <div className="course-rating">
        <div className="rating-stars">
          {renderStars(course.averageRating || 0)}
        </div>
        <div className="rating-info">
          <span className="average-rating">
            {course.averageRating ? course.averageRating.toFixed(1) : 'N/A'}
          </span>
          <span className="total-ratings">
            ({course.totalRatings || 0} ratings)
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
