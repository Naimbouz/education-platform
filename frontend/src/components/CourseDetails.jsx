import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                if (!userData || !userData.token) {
                    navigate('/login');
                    return;
                }

                console.log('Fetching course with ID:', id);
                axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
                console.log('Course data:', response.data);
                setCourse(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching course:', error);
                setError(error.response?.data?.message || 'Failed to fetch course details');
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
        }
    }, [id, navigate]);

    const handleBack = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <button
                            onClick={handleBack}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <button
                            onClick={handleBack}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-100 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <button
                            onClick={handleBack}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                    <div className="text-center p-4">Course not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                        <p className="mt-2 text-gray-600">{course.description}</p>
                    </div>
                    
                    <div className="px-6 py-4">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Teacher</h3>
                            <p className="text-gray-700">{course.teacher?.name || 'Not assigned'}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
                            {course.students && course.students.length > 0 ? (
                                <ul className="space-y-2">
                                    {course.students.map(student => (
                                        <li key={student._id} className="text-gray-700">
                                            {student.name} ({student.email})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-700">No students enrolled yet</p>
                            )}
                        </div>

                        {course.materials && course.materials.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials</h3>
                                <ul className="space-y-2">
                                    {course.materials.map((material, index) => (
                                        <li key={index} className="text-gray-700">
                                            <div className="font-medium">{material.title}</div>
                                            {material.description && (
                                                <p className="text-sm text-gray-600">{material.description}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {course.assignments && course.assignments.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignments</h3>
                                <ul className="space-y-3">
                                    {course.assignments.map((assignment, index) => (
                                        <li key={index} className="bg-gray-50 p-3 rounded-md">
                                            <div className="font-medium text-gray-900">{assignment.title}</div>
                                            {assignment.description && (
                                                <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                                            )}
                                            <div className="text-sm text-gray-500 mt-1">
                                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                {assignment.points && ` • ${assignment.points} points`}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
