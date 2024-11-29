const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('teacher', 'name email')
            .populate('students', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a course
router.post('/', async (req, res) => {
    try {
        const course = await Course.create({
            ...req.body,
            teacher: req.user.id // This will be set by auth middleware
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get single course
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', 'name email')
            .populate('students', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update course
router.put('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete course
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Join course (for students)
router.post('/:id/join', async (req, res) => {
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

        res.json({ message: 'Successfully joined the course' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
