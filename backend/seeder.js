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
        title: 'Build a Website',
        description: 'Create a simple personal website',
        dueDate: new Date('2024-04-15'),
        points: 100
      }
    ]
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/education-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected...');
  
  try {
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    console.log('Existing data cleared');

    // Hash passwords for all users
    const hashedUsers = await Promise.all(users.map(async user => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    }));
    console.log('Passwords hashed');

    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log('Users seeded');

    // Add user references to courses
    const teacherId = createdUsers.find(user => user.role === 'teacher')._id;
    const coursesWithTeacher = courses.map(course => ({
      ...course,
      teacher: teacherId
    }));

    // Insert courses
    await Course.insertMany(coursesWithTeacher);
    console.log('Courses seeded');

    // Update teacher with course references
    const createdCourses = await Course.find();
    await User.findByIdAndUpdate(
      teacherId,
      { $push: { courses: { $each: createdCourses.map(course => course._id) } } }
    );
    console.log('Teacher updated with course references');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
