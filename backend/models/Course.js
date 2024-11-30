const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true,
        maxlength: [50, 'Title cannot be more than 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    enrollmentHistory: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        enrolledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    materials: [{
        title: String,
        description: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    assignments: [{
        title: String,
        description: String,
        dueDate: Date,
        points: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    code: {
        type: String,
        unique: true
    }
});

// Generate course code before saving
courseSchema.pre('save', function(next) {
    if (!this.code) {
        this.code = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Course', courseSchema);
