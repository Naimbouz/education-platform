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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          navigate('/login');
          return;
        }

        const userData = JSON.parse(storedUser);
        if (!userData || !userData.token) {
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        // Set the authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        
        // Get user data
        const userResponse = await axios.get('http://localhost:5000/api/auth/me');
        
        if (!userResponse.data.success || !userResponse.data.user) {
          throw new Error('Failed to verify user token');
        }

        const currentUser = userResponse.data.user;
        setUser(currentUser);
        
        // Fetch courses with user ID
        console.log('Fetching courses for user:', currentUser._id);
        const coursesResponse = await axios.get('http://localhost:5000/api/courses', {
          params: { userId: currentUser._id }
        });
        
        console.log('Courses response:', coursesResponse.data);
        setCourses(Array.isArray(coursesResponse.data) ? coursesResponse.data : []);

        // If user is a teacher, fetch all students
        if (currentUser.role === 'teacher') {
          const studentsResponse = await axios.get('http://localhost:5000/api/auth/students');
          setStudents(studentsResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Dashboard - Auth check error:', error);
        setError(error.response?.data?.message || 'Authentication failed');
        setLoading(false);
        if (error.response?.status === 401) {
          localStorage.removeItem('user');
          navigate('/login');
        }
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

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  const handleEnrollStudents = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/courses/${selectedCourse._id}/enroll`,
        { studentIds: selectedStudents }
      );
      
      // Update courses list with new data
      setCourses(courses.map(course => 
        course._id === selectedCourse._id ? response.data : course
      ));
      
      setSelectedStudents([]);
      setShowEnrollModal(false);
      
      // Refresh selected course details
      setSelectedCourse(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enroll students');
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
                          <button
                            onClick={() => handleViewDetails(course)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
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
              <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
              {loading ? (
                <p>Loading courses...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : courses.length === 0 ? (
                <p className="text-gray-600">
                  You are not enrolled in any courses yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course._id} className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        Teacher: {course.teacher?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Students enrolled: {course.students?.length || 0}
                      </p>
                      <button
                        onClick={() => handleViewDetails(course)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </button>
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

      {/* Course Details Modal */}
      {showDetailsModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                <p className="text-gray-600 mt-2">{selectedCourse.description}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Teacher</h3>
                <p>{selectedCourse.teacher?.name}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Enrolled Students</h3>
                  {user?.role === 'teacher' && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowEnrollModal(true);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Enroll Students
                    </button>
                  )}
                </div>
                {selectedCourse.students?.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedCourse.students.map(student => (
                      <li key={student._id} className="p-2 bg-gray-50 rounded">
                        {student.name} ({student.email})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No students enrolled yet</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Students Modal */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Enroll Students</h2>
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedStudents([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="max-h-60 overflow-y-auto border rounded">
                {students
                  .filter(student => !selectedCourse.students?.some(s => s._id === student._id))
                  .map(student => (
                    <label
                      key={student._id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={(e) => {
                          setSelectedStudents(prev =>
                            e.target.checked
                              ? [...prev, student._id]
                              : prev.filter(id => id !== student._id)
                          );
                        }}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedStudents([]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleEnrollStudents}
                disabled={selectedStudents.length === 0}
                className={`px-4 py-2 rounded text-white ${
                  selectedStudents.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Enroll Selected Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
