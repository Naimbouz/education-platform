import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        console.log('Dashboard - Retrieved stored user data:', storedUser);

        if (!storedUser) {
          console.log('No user data found in localStorage');
          navigate('/login');
          return;
        }

        const userData = JSON.parse(storedUser);
        console.log('Dashboard - Parsed user data:', userData);

        if (!userData || !userData.token) {
          console.log('Invalid user data structure:', userData);
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        
        const response = await axios.get('http://localhost:5000/api/auth/me');
        console.log('Dashboard - Verified user data:', response.data);

        if (!response.data.success) {
          throw new Error('Failed to verify user token');
        }

        setUser(response.data.user);
        
        // Fetch courses
        const coursesResponse = await axios.get('http://localhost:5000/api/courses');
        setCourses(coursesResponse.data);

        // If user is a teacher, fetch all students
        if (response.data.user.role === 'teacher') {
          const studentsResponse = await axios.get('http://localhost:5000/api/auth/students');
          setStudents(studentsResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Dashboard - Auth check error:', error);
        localStorage.removeItem('user');
        setError('Authentication failed. Please login again.');
        setLoading(false);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/courses', newCourse);
      setCourses([...courses, response.data]);
      setShowCreateCourseModal(false);
      setNewCourse({ title: '', description: '' });
    } catch (error) {
      console.error('Create course error:', error);
      setError(error.response?.data?.message || 'Failed to create course');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Education Platform
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Teacher Dashboard */}
        {user?.role === 'teacher' && (
          <div>
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your courses and view all students
                </p>
              </div>
              <button
                onClick={() => setShowCreateCourseModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create New Course
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Courses Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Your Courses</h3>
                {courses.length === 0 ? (
                  <p className="text-gray-600">No courses yet. Create your first course!</p>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course._id} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        <div className="flex justify-between items-center">
                          <Link
                            to={`/courses/${course._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Details →
                          </Link>
                          <span className="text-sm text-gray-500">
                            {course.students?.length || 0} students enrolled
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* All Students Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">All Students</h3>
                {students.length === 0 ? (
                  <p className="text-gray-600">No students registered yet.</p>
                ) : (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <li key={student._id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{student.name}</h4>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Student Dashboard */}
        {user?.role === 'student' && (
          <div>
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-2xl font-bold text-gray-900">Student Dashboard</h2>
              <p className="mt-1 text-sm text-gray-600">
                View your enrolled courses and assignments
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Your Courses</h3>
              {courses.length === 0 ? (
                <p className="text-gray-600">You are not enrolled in any courses yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <div key={course._id} className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <Link
                        to={`/courses/${course._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
