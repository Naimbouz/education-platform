const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

// Sample data
const users = [
  {
    name: 'Teacher Demo',
    email: 'teacher@example.com',
    password: 'password123',
    role: 'teacher'
  },
  {
    name: 'Student Demo',
    email: 'student@example.com',
    password: 'password123',
    role: 'student'
  }
];

const courses = [
  {
    title: 'Introduction to Programming',
    description: 'Learn the basics of programming with JavaScript',
    code: 'PROG101',
    materials: [
      {
        title: 'Getting Started',
        description: 'Introduction to programming concepts',
        fileUrl: 'https://example.com/materials/intro.pdf'
      }
    ],
    assignments: [
      {
        title: 'First Assignment',
        description: 'Create a simple calculator',
        dueDate: new Date('2024-03-30'),
        points: 100
      }
    ]
  },
  {
    title: 'Web Development Fundamentals',
    description: 'Learn HTML, CSS, and JavaScript',
    code: 'WEB101',
    materials: [
      {
        title: 'HTML Basics',
        description: 'Introduction to HTML structure',
        fileUrl: 'https://example.com/materials/html.pdf'
      }
    ],
    assignments: [
      {
        title: 'Portfolio Project',
        description: 'Create a personal portfolio website',
        dueDate: new Date('2024-04-15'),
        points: 100
      }
    ]
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/education-platform')
  .then(async () => {
    console.log('MongoDB connected for seeding...');
    
    try {
      // Clear existing data
      await User.deleteMany();
      await Course.deleteMany();
      console.log('Data cleared...');

      // Create users
      const createdUsers = await Promise.all(
        users.map(async user => {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          return User.create({
            ...user,
            password: hashedPassword
          });
        })
      );
      console.log('Users seeded...');

      // Create courses and assign to teacher
      const teacher = createdUsers.find(user => user.role === 'teacher');
      const student = createdUsers.find(user => user.role === 'student');

      await Promise.all(
        courses.map(async course => {
          const createdCourse = await Course.create({
            ...course,
            teacher: teacher._id,
            students: [student._id]
          });

          // Update teacher's courses
          await User.findByIdAndUpdate(
            teacher._id,
            { $push: { courses: createdCourse._id } }
          );

          // Update student's courses
          await User.findByIdAndUpdate(
            student._id,
            { $push: { courses: createdCourse._id } }
          );
        })
      );
      console.log('Courses seeded...');

      console.log('Data seeding completed!');
      console.log('\nYou can now log in with:');
      console.log('Teacher - Email: teacher@example.com, Password: password123');
      console.log('Student - Email: student@example.com, Password: password123');
      
      process.exit(0);
    } catch (error) {
      console.error('Error seeding data:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
