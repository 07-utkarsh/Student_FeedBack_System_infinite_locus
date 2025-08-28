const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Feedback = require('../models/Feedback');

// Identity from headers
const withIdentity = (req, res, next) => {
  req.userRole = (req.header('x-user-role') || 'student').toLowerCase();
  next();
};


const requireAdmin = (req, res, next) => {
  if ((req.userRole || '').toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};


// Get all courses with statistics (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const feedbacks = await Feedback.find({ courseId: course._id });
        const totalRatings = feedbacks.length;
        const averageRating = totalRatings > 0 
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings 
          : 0;
        
        return {
          ...course.toObject(),
          totalRatings,
          averageRating: Math.round(averageRating * 100) / 100
        };
      })
    );
    res.json(coursesWithStats);
  } catch (error) {
    console.error('Error loading courses:', error);
    res.status(500).json({ message: 'Error loading courses' });
  }
});

// Get single course (public)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Error loading course:', error);
    res.status(500).json({ message: 'Error loading course' });
  }
});


router.use(withIdentity);


module.exports = router;