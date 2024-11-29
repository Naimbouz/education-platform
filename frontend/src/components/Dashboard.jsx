import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/auth.service';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      navigate('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        console.log('Fetching courses with token:', user.token);
        const response = await axios.get('http://localhost:5000/api/courses', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        console.log('Courses response:', response.data);
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        if (err.response?.status === 401) {
          // Token expired or invalid
          authService.logout();
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch courses');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Education Platform</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">
                Welcome, {user.user.name} ({user.user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Courses</h2>
            {user.user.role === 'teacher' && (
              <button
                onClick={() => navigate('/create-course')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Create New Course
              </button>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-500">No courses found.</p>
              {user.user.role === 'teacher' && (
                <p className="mt-2">
                  Get started by creating your first course using the button above.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Code: {course.code}
                    </span>
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
