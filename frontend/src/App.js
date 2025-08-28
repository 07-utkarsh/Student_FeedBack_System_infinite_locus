import React, { useState, useEffect } from 'react';
import CourseList from './components/CourseList';
import CourseFeedback from './components/CourseFeedback';
import AnalyticsPage from './components/AnalyticsPage';
import AdminPanel from './components/AdminPanel';
import { api } from './api';
import './styles.css';

function App() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentView, setCurrentView] = useState('courses');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('student');

  // Force B&W theme
  useEffect(() => {
    document.body.classList.add('theme-mono');
  }, []);

  // Basic path routing and role inference
  useEffect(() => {
    const applyRoute = () => {
      const path = (window.location.pathname || '/').toLowerCase();
      if (path.startsWith('/adminpanel')) {
        setRole('admin');
        localStorage.setItem('role', 'admin');
        setCurrentView('admin');
      } else if (path.startsWith('/analytics')) {
        setRole('admin');
        localStorage.setItem('role', 'admin');
        setCurrentView('analytics');
      } else if (path.startsWith('/courses')) {
        setRole('student');
        localStorage.setItem('role', 'student');
        setCurrentView('courses');
      } else if (path.startsWith('/feedback')) {
        setRole(localStorage.getItem('role') || 'student');
        setCurrentView('feedback');
      } else {
        // default route -> courses
        setRole('student');
        localStorage.setItem('role', 'student');
        setCurrentView('courses');
        if (window.location.pathname !== '/courses') {
          window.history.replaceState({}, '', '/courses');
        }
      }
    };

    applyRoute();
    const onPop = () => applyRoute();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCurrentView('feedback');
    navigate('feedback');
  };

  const navigate = (view) => {
    if (view === 'courses') window.history.pushState({}, '', '/courses');
    if (view === 'analytics') window.history.pushState({}, '', '/analytics');
    if (view === 'admin') window.history.pushState({}, '', '/adminPanel');
    if (view === 'feedback') window.history.pushState({}, '', '/feedback');
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'feedback':
        return (
          <CourseFeedback
            course={selectedCourse}
            onBack={() => navigate('courses')}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            courses={courses}
            onBack={() => navigate('courses')}
          />
        );
      case 'admin':
        return (
          <AdminPanel
            onBack={() => navigate('courses')}
          />
        );
      default:
        return (
          <CourseList
            courses={courses}
            onCourseSelect={handleCourseSelect}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Student Feedback System</h1>
        <nav className="nav-menu">
          <button
            className={`nav-button ${currentView === 'courses' ? 'active' : ''}`}
            onClick={() => navigate('courses')}
          >
            Courses
          </button>
          {role === 'admin' && (
            <>
              <button
                className={`nav-button ${currentView === 'analytics' ? 'active' : ''}`}
                onClick={() => navigate('analytics')}
              >
                Analytics
              </button>
              <button
                className={`nav-button ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => navigate('admin')}
              >
                Admin Panel
              </button>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
