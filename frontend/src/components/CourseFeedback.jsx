import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './CourseFeedback.css';

const CourseFeedback = ({ course, onBack, role = 'student', name = '' }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    rating: 0,
    comment: '',
    studentName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 0, comment: '', studentName: '' });

  useEffect(() => {
    loadFeedbacks();
  }, [course._id]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await api.getFeedback(course._id);
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name: field, value } = e.target;
    setNewFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setNewFeedback(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const effectiveName = (name && name.trim()) ? name.trim() : newFeedback.studentName.trim();
    if (!newFeedback.rating || !effectiveName) {
      alert('Please provide a rating and your name');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitFeedback({
        rating: newFeedback.rating,
        comment: newFeedback.comment,
        studentName: effectiveName,
        courseId: course._id
      });
      
      // Reset form and reload feedbacks
      setNewFeedback({ rating: 0, comment: '', studentName: '' });
      setShowAddForm(false);
      loadFeedbacks();
      
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
        onClick={() => interactive && onChange && onChange(star)}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(feedback => {
      distribution[feedback.rating]++;
    });
    return distribution;
  };

  const renderRatingDistribution = () => {
    const distribution = getRatingDistribution();
    const total = feedbacks.length;
    
    return [5, 4, 3, 2, 1].map(rating => {
      const count = distribution[rating];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      
      return (
        <div key={rating} className="rating-distribution-row">
          <div className="rating-label">
            <span className="rating-number">{rating}</span>
            <span className="rating-stars-small">
              {renderStars(rating)}
            </span>
          </div>
          <div className="rating-bar-container">
            <div 
              className="rating-bar" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="rating-count">
            {count} ({percentage}%)
          </div>
        </div>
      );
    });
  };

  const canModify = (feedback) => {
    const isAdmin = (role || '').toLowerCase() === 'admin';
    const isOwner = (name || '') && feedback.studentName && feedback.studentName.toLowerCase() === name.toLowerCase();
    return isAdmin || isOwner;
  };

  const startEdit = (feedback) => {
    setEditingId(feedback._id);
    setEditForm({ rating: feedback.rating, comment: feedback.comment || '', studentName: feedback.studentName || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 0, comment: '', studentName: '' });
  };

  const saveEdit = async () => {
    try {
      await api.updateFeedback(editingId, {
        rating: editForm.rating,
        comment: editForm.comment,
        studentName: editForm.studentName
      });
      setEditingId(null);
      await loadFeedbacks();
      alert('Feedback updated');
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await api.deleteFeedback(id);
      await loadFeedbacks();
      alert('Feedback deleted');
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="course-feedback">
        <div className="feedback-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Courses
          </button>
          <h2>Course Feedback</h2>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-feedback">
      <div className="feedback-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Courses
        </button>
        <h2>Course Feedback</h2>
        <button 
          className="add-feedback-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '− Hide Form' : '+ Add Feedback'}
        </button>
      </div>

      <div className="course-summary animate-fade-in-up">
        <div className="course-info">
          <h3>{course.name}</h3>
          <div className="course-details">
            <span className="course-code">{course.code}</span>
            <span className="instructor">Instructor: {course.instructor}</span>
          </div>
          {course.description && (
            <p className="course-description">{course.description}</p>
          )}
        </div>
        <div className="course-stats">
          <div className="stat">
            <span className="stat-label">Total Feedback</span>
            <span className="stat-value">{feedbacks.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Average Rating</span>
            <div className="rating-display">
              <span className="rating-value">
                {feedbacks.length > 0 
                  ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
                  : 'N/A'
                }
              </span>
              <div className="rating-stars">
                {renderStars(
                  feedbacks.length > 0 
                    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
                    : 0
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      {feedbacks.length > 0 && (
        <div className="rating-distribution-container animate-fade-in-up">
          <h3>Rating Distribution</h3>
          <div className="rating-distribution-chart">
            {renderRatingDistribution()}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="feedback-form-container animate-scale-in">
          <h3>Add Your Feedback</h3>
          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Rating *</label>
              <div className="star-rating-input">
                {renderStars(newFeedback.rating, true, handleRatingChange)}
                <span className="rating-text">
                  {newFeedback.rating > 0 ? `${newFeedback.rating} star${newFeedback.rating > 1 ? 's' : ''}` : 'Select rating'}
                </span>
              </div>
            </div>

            {!name && (
              <div className="form-group">
                <label htmlFor="studentName">Your Name *</label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={newFeedback.studentName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="comment">Comment</label>
              <textarea
                id="comment"
                name="comment"
                value={newFeedback.comment}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about this course (optional)"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`submit-btn ${submitting ? 'animate-pulse' : ''}`}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="feedbacks-section">
        <h3>All Feedback ({feedbacks.length})</h3>
        
        {feedbacks.length === 0 ? (
          <div className="empty-state animate-fade-in-up">
            <h4>No feedback yet</h4>
            <p>Be the first to share your thoughts about this course!</p>
          </div>
        ) : (
          <div className="feedbacks-list">
            {feedbacks.map((feedback, index) => (
              <div 
                key={feedback._id} 
                className="feedback-item animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feedback-header">
                  <div className="feedback-meta">
                    <span className="student-name">{feedback.studentName}</span>
                    <span className="feedback-date">{formatDate(feedback.createdAt)}</span>
                  </div>
                  <div className="feedback-rating">
                    {renderStars(feedback.rating)}
                  </div>
                </div>

                {editingId === feedback._id ? (
                  <div className="feedback-edit-form">
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Edit Rating</label>
                      <div className="star-rating-input">
                        {renderStars(editForm.rating, true, (r) => setEditForm(prev => ({ ...prev, rating: r })))}
                        <span className="rating-text">
                          {editForm.rating > 0 ? `${editForm.rating} star${editForm.rating > 1 ? 's' : ''}` : 'Select rating'}
                        </span>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label htmlFor={`edit-comment-${feedback._id}`}>Edit Comment</label>
                      <textarea
                        id={`edit-comment-${feedback._id}`}
                        value={editForm.comment}
                        onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                        rows="3"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label htmlFor={`edit-name-${feedback._id}`}>Name</label>
                      <input
                        id={`edit-name-${feedback._id}`}
                        type="text"
                        value={editForm.studentName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, studentName: e.target.value }))}
                      />
                    </div>
                    <div className="feedback-actions">
                      <button className="small-btn" onClick={saveEdit}>Save</button>
                      <button className="small-btn outline" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {feedback.comment && (
                      <div className="feedback-comment">
                        <p>{feedback.comment}</p>
                      </div>
                    )}
                    {canModify(feedback) && (
                      <div className="feedback-actions">
                        <button className="small-btn" onClick={() => startEdit(feedback)}>Edit</button>
                        <button className="small-btn danger" onClick={() => deleteFeedback(feedback._id)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseFeedback;
