import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './AdminPanel.css';

const AdminPanel = ({ onBack }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    instructor: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      showNotification('Error loading courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
      ${type === 'error' ? 'background: #e74c3c;' : 
        type === 'success' ? 'background: #27ae60;' : 
        'background: #3498db;'}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Course code is required';
    } else if (formData.code.trim().length < 3) {
      newErrors.code = 'Course code must be at least 3 characters';
    }
    
    if (!formData.instructor.trim()) {
      newErrors.instructor = 'Instructor name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      instructor: '',
      description: ''
    });
    setEditingCourse(null);
    setShowAddForm(false);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingCourse) {
        const result = await api.updateCourse(editingCourse._id, formData);
        showNotification('Course updated successfully!', 'success');
      } else {
        const result = await api.createCourse(formData);
        showNotification('Course created successfully!', 'success');
      }
      
      resetForm();
      loadCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      showNotification('Error saving course: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      instructor: course.instructor,
      description: course.description || ''
    });
    setShowAddForm(true);
    setErrors({});
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This will also delete all associated feedback.')) {
      try {
        await api.deleteCourse(courseId);
        showNotification('Course deleted successfully!', 'success');
        loadCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        showNotification('Error deleting course: ' + error.message, 'error');
      }
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Courses
          </button>
          <h2>Admin Panel</h2>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Courses
        </button>
        <h2>Admin Panel</h2>
        <button 
          className="add-course-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Course
        </button>
      </div>

      <div className="admin-content">
        {showAddForm && (
          <div className="course-form-container animate-scale-in">
            <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
            <form className="course-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Course Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter course name"
                  className={errors.name ? 'error' : ''}
                  required
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="code">Course Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter course code (e.g., CS101)"
                  className={errors.code ? 'error' : ''}
                  required
                />
                {errors.code && <span className="error-message">{errors.code}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="instructor">Instructor *</label>
                <input
                  type="text"
                  id="instructor"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  placeholder="Enter instructor name"
                  className={errors.instructor ? 'error' : ''}
                  required
                />
                {errors.instructor && <span className="error-message">{errors.instructor}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter course description (optional)"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`submit-btn ${submitting ? 'animate-pulse' : ''}`}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="courses-management">
          <h3>Manage Courses ({courses.length})</h3>
          <div className="courses-table-container">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th>Instructor</th>
                  <th>Total Ratings</th>
                  <th>Average Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="course-row animate-scale-in">
                    <td>{course.name}</td>
                    <td>
                      <span className="course-code-badge">{course.code}</span>
                    </td>
                    <td>{course.instructor}</td>
                    <td>{course.totalRatings || 0}</td>
                    <td>
                      <div className="rating-display">
                        <span className="rating-value">{course.averageRating ? course.averageRating.toFixed(1) : 'N/A'}</span>
                        <div className="rating-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={`star ${star <= (course.averageRating || 0) ? 'filled' : 'empty'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(course)}
                          title="Edit course"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(course._id)}
                          title="Delete course"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {courses.length === 0 && (
            <div className="empty-state animate-fade-in-up">
              <h3>No courses available</h3>
              <p>Create your first course to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
