const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Course = require('../models/Course');

// Simple role/identity extraction middleware (from headers)
const withIdentity = (req, res, next) => {
  req.userRole = (req.header('x-user-role') || 'student').toLowerCase();
  req.userName = (req.header('x-user-name') || '').trim();
  next();
};

const requireAdmin = (req, res, next) => {
  if ((req.userRole || '').toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.use(withIdentity);

router.post('/', async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Ensure studentName is present (used for ownership)
    if (!req.body.studentName || !req.body.studentName.trim()) {
      return res.status(400).json({ message: 'studentName is required' });
    }
    
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('courseId', 'name code');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/course/:courseId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ courseId: req.params.courseId }).populate('courseId', 'name code');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update feedback: owner (by studentName) or admin
router.put('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const isOwner = req.userName && feedback.studentName && feedback.studentName.toLowerCase() === req.userName.toLowerCase();
    const isAdmin = (req.userRole || '').toLowerCase() === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this feedback' });
    }

    const allowed = {};
    if (typeof req.body.rating !== 'undefined') allowed.rating = req.body.rating;
    if (typeof req.body.comment !== 'undefined') allowed.comment = req.body.comment;
    if (typeof req.body.studentName !== 'undefined') allowed.studentName = req.body.studentName; // allow rename

    const updated = await Feedback.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete feedback: owner or admin
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const isOwner = req.userName && feedback.studentName && feedback.studentName.toLowerCase() === req.userName.toLowerCase();
    const isAdmin = (req.userRole || '').toLowerCase() === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    const ratingDistribution = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalFeedbacks,
      averageRating: Math.round((averageRating[0]?.avgRating || 0) * 100) / 100,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
