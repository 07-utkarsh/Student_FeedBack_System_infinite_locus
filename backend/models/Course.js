const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    minlength: [2, 'Course name must be at least 2 characters long'],
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'Course code must be at least 3 characters long'],
    maxlength: [20, 'Course code cannot exceed 20 characters'],
    match: [/^[A-Z0-9]+$/, 'Course code can only contain uppercase letters and numbers']
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true,
    minlength: [2, 'Instructor name must be at least 2 characters long'],
    maxlength: [100, 'Instructor name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Course description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
courseSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Create a compound index for better performance
courseSchema.index({ code: 1, name: 1 });

// Virtual for course display name
courseSchema.virtual('displayName').get(function() {
  return `${this.code} - ${this.name}`;
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
