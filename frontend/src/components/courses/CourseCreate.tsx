import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseCreate: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/courses', {
        title,
        description,
      });
      navigate('/courses');
    } catch (err) {
      setError('Failed to create course');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Course</h3>
            <p className="mt-1 text-sm text-gray-600">
              Fill in the details to create a new course. Students will be able to join using the generated course code.
            </p>
          </div>
        </div>
        
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                {error && (
                  <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Course Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Introduction to Programming"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Enter course description"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Brief description of the course content and objectives.
                  </p>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Create Course
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseCreate;
