import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { api } from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = ({ courses, onBack }) => {
  const [overallStats, setOverallStats] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadOverallStats();
  }, []);

  const loadOverallStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await api.getOverallStats();
      setOverallStats(stats);
    } catch (error) {
      console.error('Error loading overall stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCourseAnalytics = async (courseId) => {
    try {
      setLoading(true);
      const analytics = await api.getCourseAnalytics(courseId);
      setCourseAnalytics(analytics);
    } catch (error) {
      console.error('Error loading course analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    if (courseId) {
      const course = courses.find(c => c._id === courseId);
      setSelectedCourse(course);
      loadCourseAnalytics(courseId);
    } else {
      setSelectedCourse(null);
      setCourseAnalytics(null);
    }
  };

  const overallRatingData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Ratings',
        data: overallStats ? [
          overallStats.ratingDistribution[1] || 0,
          overallStats.ratingDistribution[2] || 0,
          overallStats.ratingDistribution[3] || 0,
          overallStats.ratingDistribution[4] || 0,
          overallStats.ratingDistribution[5] || 0,
        ] : [],
        backgroundColor: [
          '#ff6b6b',
          '#ffa726',
          '#ffd54f',
          '#66bb6a',
          '#42a5f5'
        ],
        borderWidth: 1,
      },
    ],
  };

  const courseRatingData = courseAnalytics ? {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Ratings',
        data: [
          courseAnalytics.ratingDistribution[1] || 0,
          courseAnalytics.ratingDistribution[2] || 0,
          courseAnalytics.ratingDistribution[3] || 0,
          courseAnalytics.ratingDistribution[4] || 0,
          courseAnalytics.ratingDistribution[5] || 0,
        ],
        backgroundColor: [
          '#ff6b6b',
          '#ffa726',
          '#ffd54f',
          '#66bb6a',
          '#42a5f5'
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const pieData = courseAnalytics ? {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        data: [
          courseAnalytics.ratingDistribution[1] || 0,
          courseAnalytics.ratingDistribution[2] || 0,
          courseAnalytics.ratingDistribution[3] || 0,
          courseAnalytics.ratingDistribution[4] || 0,
          courseAnalytics.ratingDistribution[5] || 0,
        ],
        backgroundColor: [
          '#ff6b6b',
          '#ffa726',
          '#ffd54f',
          '#66bb6a',
          '#42a5f5'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  } : null;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Courses
        </button>
        <h2>Analytics Dashboard</h2>
      </div>

      <div className="analytics-content">
        <div className="overall-stats">
          <h3>Overall Statistics</h3>
          {statsLoading ? (
            <div className="stats-grid">
              {[1, 2].map((i) => (
                <div key={i} className="stat-card skeleton" style={{ height: '100px' }}>
                  <div className="skeleton" style={{ height: '15px', marginBottom: '10px' }}></div>
                  <div className="skeleton" style={{ height: '30px' }}></div>
                </div>
              ))}
            </div>
          ) : overallStats ? (
            <div className="stats-grid">
              <div className="stat-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <h4>Total Feedbacks</h4>
                <p className="stat-value">{overallStats.totalFeedbacks}</p>
              </div>
              <div className="stat-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <h4>Average Rating</h4>
                <p className="stat-value">{overallStats.averageRating}</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No statistics available</p>
            </div>
          )}
          
          <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h4>Overall Rating Distribution</h4>
            {overallStats ? (
              <Bar data={overallRatingData} />
            ) : (
              <div className="skeleton" style={{ height: '300px' }}></div>
            )}
          </div>
        </div>

        <div className="course-analytics">
          <h3>Course-Specific Analytics</h3>
          <div className="course-selector">
            <label htmlFor="courseSelect">Select Course:</label>
            <select
              id="courseSelect"
              value={selectedCourse?._id || ''}
              onChange={handleCourseChange}
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && courseAnalytics && (
            <div className="course-stats">
              <div className="stats-grid">
                <div className="stat-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <h4>Total Ratings</h4>
                  <p className="stat-value">{courseAnalytics.totalRatings}</p>
                </div>
                <div className="stat-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <h4>Average Rating</h4>
                  <p className="stat-value">{courseAnalytics.averageRating}</p>
                </div>
              </div>

              <div className="charts-row">
                <div className="chart-container animate-fade-in-left" style={{ animationDelay: '0.3s' }}>
                  <h4>Rating Distribution (Bar Chart)</h4>
                  <Bar data={courseRatingData} />
                </div>
                <div className="chart-container animate-fade-in-right" style={{ animationDelay: '0.4s' }}>
                  <h4>Rating Distribution (Pie Chart)</h4>
                  <Pie data={pieData} />
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading course analytics...</p>
            </div>
          )}

          {!selectedCourse && !loading && (
            <div className="empty-state animate-fade-in-up">
              <h3>Select a Course</h3>
              <p>Choose a course from the dropdown above to view detailed analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
