import React, { useState } from 'react';

const FeedbackForm = ({ course, onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    studentName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!formData.comment.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-button ${i <= formData.rating ? 'active' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, rating: i }))}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="feedback-form-container">
      <div className="feedback-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Courses
        </button>
        <h2>Submit Feedback</h2>
        <div className="course-summary">
          <h3>{course.name}</h3>
          <p className="course-code">{course.code} • {course.instructor}</p>
        </div>
      </div>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="studentName">Your Name:</label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            className="animate-scale-in"
          />
        </div>

        <div className="form-group">
          <label>Rating:</label>
          <div className="rating-input">
            {renderStars()}
            <span className="rating-value">{formData.rating}/5</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Comment:</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Share your thoughts about this course..."
            rows="4"
            required
            className="animate-scale-in"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onBack}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`submit-btn ${isSubmitting ? 'animate-pulse' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
