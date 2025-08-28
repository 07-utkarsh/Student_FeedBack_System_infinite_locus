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

router.use(withIdentity);

// Validation middleware
const validateCourseData = (req, res, next) => {
  const { name, code, instructor } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Course name is required' });
  }
  
  if (!code || !code.trim()) {
    return res.status(400).json({ message: 'Course code is required' });
  }
  
  if (!instructor || !instructor.trim()) {
    return res.status(400).json({ message: 'Instructor name is required' });
  }
  
  // Check if course code already exists
  Course.findOne({ code: code.trim() })
    .then(existingCourse => {
      if (existingCourse && (!req.params.id || existingCourse._id.toString() !== req.params.id)) {
        return res.status(400).json({ message: 'Course code already exists' });
      }
      next();
    })
    .catch(error => {
      res.status(500).json({ message: 'Error checking course code' });
    });
};

// Create new course (admin only)
router.post('/', requireAdmin, validateCourseData, async (req, res) => {
  try {
    const courseData = {
      name: req.body.name.trim(),
      code: req.body.code.trim().toUpperCase(),
      instructor: req.body.instructor.trim(),
      description: req.body.description ? req.body.description.trim() : ''
    };
    
    const course = new Course(courseData);
    await course.save();
    
    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Course code already exists' });
    } else {
      res.status(500).json({ message: 'Error creating course' });
    }
  }
});

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

// Update course (admin only)
router.put('/:id', requireAdmin, validateCourseData, async (req, res) => {
  try {
    const courseData = {
      name: req.body.name.trim(),
      code: req.body.code.trim().toUpperCase(),
      instructor: req.body.instructor.trim(),
      description: req.body.description ? req.body.description.trim() : ''
    };
    
    const course = await Course.findByIdAndUpdate(
      req.params.id, 
      courseData, 
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Course code already exists' });
    } else {
      res.status(500).json({ message: 'Error updating course' });
    }
  }
});

// Delete course (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Delete associated feedback first
    await Feedback.deleteMany({ courseId: req.params.id });
    
    // Delete the course
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Course and associated feedback deleted successfully',
      deletedCourse: course
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
});

// Get course analytics (admin only)
router.get('/:id/analytics', requireAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const feedbacks = await Feedback.find({ courseId: req.params.id });
    const totalRatings = feedbacks.length;
    const averageRating = totalRatings > 0 
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings 
      : 0;
    
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = feedbacks.filter(f => f.rating === i).length;
    }
    
    res.json({
      course: {
        name: course.name,
        code: course.code,
        instructor: course.instructor
      },
      totalRatings,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error loading course analytics:', error);
    res.status(500).json({ message: 'Error loading course analytics' });
  }
});

// Get course statistics summary (admin only)
router.get('/stats/summary', requireAdmin, async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalFeedbacks = await Feedback.countDocuments();
    
    const coursesWithFeedback = await Course.aggregate([
      {
        $lookup: {
          from: 'feedbacks',
          localField: '_id',
          foreignField: 'courseId',
          as: 'feedbacks'
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          totalRatings: { $size: '$feedbacks' },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$feedbacks' }, 0] },
              then: { $avg: '$feedbacks.rating' },
              else: 0
            }
          }
        }
      },
      {
        $sort: { totalRatings: -1 }
      }
    ]);
    
    res.json({
      totalCourses,
      totalFeedbacks,
      topCourses: coursesWithFeedback.slice(0, 5)
    });
  } catch (error) {
    console.error('Error loading course statistics:', error);
    res.status(500).json({ message: 'Error loading course statistics' });
  }
});

module.exports = router;
