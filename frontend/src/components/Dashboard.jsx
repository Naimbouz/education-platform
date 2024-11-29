import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get stored user data
        const storedUser = localStorage.getItem('user');
        console.log('Dashboard - Retrieved stored user data:', storedUser);

        if (!storedUser) {
          console.log('No user data found in localStorage');
          navigate('/login');
          return;
        }

        // Parse the stored user data
        const userData = JSON.parse(storedUser);
        console.log('Dashboard - Parsed user data:', userData);

        if (!userData || !userData.token) {
          console.log('Invalid user data structure:', userData);
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        // Set the authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        
        // Verify the token by making a request to /api/auth/me
        const response = await axios.get('http://localhost:5000/api/auth/me');
        console.log('Dashboard - Verified user data:', response.data);

        if (!response.data.success) {
          throw new Error('Failed to verify user token');
        }

        setUser(response.data.user);
        setLoading(false);
      } catch (error) {
        console.error('Dashboard - Auth check error:', error);
        localStorage.removeItem('user');
        setError('Session expired. Please login again.');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        setCourses(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch courses');
        }
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Education Platform</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div>
                  <span className="text-gray-700 mr-4">Welcome, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            {user?.role === 'teacher' ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
                  <button
                    onClick={() => navigate('/courses/create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Create New Course
                  </button>
                </div>

                {courses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No courses found.
                    {' Click the "Create New Course" button to get started.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                      <div
                        key={course._id}
                        className="bg-white overflow-hidden shadow rounded-lg"
                      >
                        <div className="px-4 py-5 sm:p-6">
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {course.description}
                          </p>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:px-6">
                          <button
                            onClick={() => navigate(`/courses/${course._id}`)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
                {/* Add student-specific content here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
