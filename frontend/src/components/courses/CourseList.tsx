import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface Course {
  _id: string;
  title: string;
  description: string;
  code: string;
  students: number;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const deleteCourse = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`);
      setCourses(courses.filter(course => course._id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Courses</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all courses {user?.role === 'teacher' ? 'you teach' : 'you are enrolled in'}.
          </p>
        </div>
        {user?.role === 'teacher' && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/courses/create"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              Create Course
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Course Code
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Students
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">{course.title}</div>
                        <div className="text-gray-500">{course.description}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {course.code}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {course.students}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          to={`/courses/${course._id}`}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          View
                        </Link>
                        {user?.role === 'teacher' && (
                          <>
                            <Link
                              to={`/courses/${course._id}/edit`}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteCourse(course._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;
