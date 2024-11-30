const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Helper function to check if user is teacher
const isTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Only teachers can perform this action' });
    }
    next();
};

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        console.log('GET /api/courses - User:', {
            id: req.user._id,
            role: req.user.role,
            email: req.user.email
        });

        let courses = [];
        
        if (req.user.role === 'teacher') {
            console.log('Fetching teacher courses');
            courses = await Course.find({ teacher: req.user._id })
                .populate('teacher', 'name email')
                .populate('students', 'name email');
        } else {
            console.log('Fetching enrolled courses for student with ID:', req.user._id);
            courses = await Course.find({ students: req.user._id })
                .populate('teacher', 'name email')
                .populate('students', 'name email');
        }

        console.log('Found courses:', courses.length);
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Teachers only)
router.post('/', [auth, isTeacher], async (req, res) => {
    try {
        const { title, description } = req.body;

        // Create new course
        const course = new Course({
            title,
            description,
            teacher: req.user.id,
            students: [],
            enrollmentHistory: []
        });

        console.log('Creating new course:', course); // Debug log
        await course.save();

        // Return populated course
        const populatedCourse = await Course.findById(course._id)
            .populate('teacher', 'name email')
            .populate('students', 'name email');

        res.json(populatedCourse);
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', 'name email')
            .populate('students', 'name email')
            .populate('enrollmentHistory.student', 'name email')
            .populate('enrollmentHistory.enrolledBy', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user has access to this course
        if (req.user.role === 'student' && !course.students.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }
        
        res.json(course);
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Teachers only)
router.put('/:id', [auth, isTeacher], async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Make sure user is course teacher
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(course);
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Teachers only)
router.delete('/:id', [auth, isTeacher], async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Make sure user is course teacher
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await course.remove();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll students in a course
// @access  Private (Teachers only)
router.post('/:id/enroll', [auth, isTeacher], async (req, res) => {
    try {
        console.log('Enrolling students - Course ID:', req.params.id);
        console.log('Student IDs to enroll:', req.body.studentIds);

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Make sure user is course teacher
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to modify this course' });
        }

        // Validate request body
        if (!req.body.studentIds || !Array.isArray(req.body.studentIds)) {
            return res.status(400).json({ message: 'Please provide an array of student IDs' });
        }

        // Convert existing students to strings for comparison
        const existingStudents = course.students.map(id => id.toString());
        
        // Filter out students that are already enrolled
        const newStudents = req.body.studentIds.filter(id => !existingStudents.includes(id.toString()));
        
        console.log('New students to be enrolled:', newStudents);

        // Add new students to the course
        course.students = [...existingStudents, ...newStudents];

        // Save the updated course
        const updatedCourse = await course.save();
        
        // Populate the course with student details
        const populatedCourse = await Course.findById(updatedCourse._id)
            .populate('teacher', 'name email')
            .populate('students', 'name email');

        console.log('Course updated successfully:', populatedCourse);
        
        res.json(populatedCourse);
    } catch (error) {
        console.error('Enroll students error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private (Students only)
router.post('/:id/enroll', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if student is already enrolled
        if (course.students.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        course.students.push(req.user.id);
        await course.save();

        res.json({ message: 'Successfully enrolled in the course' });
    } catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
