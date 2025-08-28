const mongoose = require('mongoose');
const Course = require('./models/Course');
const Feedback = require('./models/Feedback');
const connectDB = require('./config/db');

const sampleCourses = [
  { name: 'Introduction to Computer Science', code: 'CS101', instructor: 'Dr. Smith', description: 'Basic concepts of programming and computer science' },
  { name: 'Data Structures and Algorithms', code: 'CS201', instructor: 'Dr. Johnson', description: 'Advanced programming concepts and problem solving' },
  { name: 'Web Development', code: 'CS301', instructor: 'Dr. Williams', description: 'Modern web technologies and frameworks' },
  { name: 'Database Systems', code: 'CS310', instructor: 'Dr. Martinez', description: 'Relational and NoSQL databases, normalization, indexing' },
  { name: 'Operating Systems', code: 'CS320', instructor: 'Dr. Anderson', description: 'Processes, threads, scheduling, memory management, file systems' },
  { name: 'Computer Networks', code: 'CS330', instructor: 'Dr. Thomas', description: 'OSI model, TCP/IP, routing, switching, network security basics' },
  { name: 'Software Engineering', code: 'CS340', instructor: 'Dr. Taylor', description: 'SDLC, agile methods, testing, CI/CD, design patterns' },
  { name: 'Human-Computer Interaction', code: 'CS350', instructor: 'Dr. Lee', description: 'Usability, accessibility, prototyping, user research' },
  { name: 'Artificial Intelligence', code: 'CS360', instructor: 'Dr. White', description: 'Search, planning, knowledge representation, intro to ML' },
  { name: 'Machine Learning', code: 'CS370', instructor: 'Dr. Harris', description: 'Supervised/unsupervised learning, model evaluation, pipelines' },
  { name: 'Mobile App Development', code: 'CS380', instructor: 'Dr. Clark', description: 'iOS/Android fundamentals, cross-platform frameworks, UX on mobile' },
  { name: 'Cloud Computing', code: 'CS390', instructor: 'Dr. Lewis', description: 'Containers, orchestration, serverless, cloud architecture' }
];

const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Karen', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Ruby', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zane'];
const lastNames = ['Johnson', 'Smith', 'Davis', 'Wilson', 'Brown', 'Miller', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis'];

const comments = [
  'Excellent course! Very well structured.',
  'Great content, learned a lot.',
  'Amazing instructor and materials.',
  'Good course but could be more interactive.',
  'Solid foundation for beginners.',
  'Challenging but rewarding.',
  'Clear explanations and practical examples.',
  'Loved the projects and assignments.',
  'Could use more real-world case studies.',
  'The pacing was perfect for me.',
  'Lecture notes were helpful and concise.',
  'Labs were very informative.',
  'Office hours were super helpful.',
  'I would recommend this to my friends.',
  'Slides could be improved, but overall great.',
  'The instructor was very engaging.',
  'Assignments were a bit tough but fair.',
  'Great balance between theory and practice.',
  'I now feel confident in this topic.',
  'Could have more optional readings.'
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[randomInt(0, arr.length - 1)];
const randomName = () => `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;

const seedDatabase = async () => {
  try {
    await connectDB();

    await Course.deleteMany({});
    await Feedback.deleteMany({});

    const courses = await Course.insertMany(sampleCourses);

    for (const course of courses) {
      const count = randomInt(5, 15);
      const batch = [];
      for (let i = 0; i < count; i++) {
        batch.push({
          rating: randomInt(1, 5),
          comment: Math.random() < 0.85 ? randomFrom(comments) : '',
          studentName: randomName(),
          courseId: course._id
        });
      }
      await Feedback.insertMany(batch);
    }

    console.log('Database seeded successfully with expanded data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
