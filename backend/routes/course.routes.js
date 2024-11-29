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
        let courses;
        if (req.user.role === 'teacher') {
            courses = await Course.find({ teacher: req.user.id })
                .populate('teacher', 'name email')
                .populate('students', 'name email');
        } else {
            courses = await Course.find({ students: req.user.id })
                .populate('teacher', 'name email')
                .populate('students', 'name email');
        }
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/courses
// @desc    Create a course
// @access  Private (Teachers only)
router.post('/', [auth, isTeacher], async (req, res) => {
    try {
        const course = await Course.create({
            ...req.body,
            teacher: req.user.id
        });
        res.status(201).json(course);
    } catch (error) {
        console.error('Create course error:', error);
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', 'name email')
            .populate('students', 'name email');
        
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
        res.status(400).json({ message: error.message });
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
