const API_BASE_URL = 'http://localhost:5000/api';

// Read role and name from localStorage (fallbacks)
const getIdentityHeaders = () => {
  const role = (localStorage.getItem('role') || 'student').toLowerCase();
  const name = localStorage.getItem('name') || '';
  return {
    'x-user-role': role,
    'x-user-name': name
  };
};

export const api = {
  async getCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  async getCourse(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  async createCourse(courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getIdentityHeaders()
        },
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create course');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  async updateCourse(id, courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getIdentityHeaders()
        },
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  async deleteCourse(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: {
          ...getIdentityHeaders()
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  async submitFeedback(feedbackData) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getIdentityHeaders()
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  async updateFeedback(id, feedbackData) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getIdentityHeaders()
        },
        body: JSON.stringify(feedbackData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update feedback');
      }
      return response.json();
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  async deleteFeedback(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        method: 'DELETE',
        headers: {
          ...getIdentityHeaders()
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete feedback');
      }
      return response.json();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },

  async getFeedback(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/course/${courseId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  async getCourseAnalytics(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/analytics`, {
        headers: {
          ...getIdentityHeaders()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  },

  async getOverallStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/stats`, {
        headers: {
          ...getIdentityHeaders()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching overall stats:', error);
      throw error;
    }
  },

  async getCourseStatsSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/stats/summary`, {
        headers: {
          ...getIdentityHeaders()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching course stats summary:', error);
      throw error;
    }
  }
};
