/**
 * SunoHostel MongoDB Mongoose Models (Alternative NoSQL Database Layer)
 * Covers Users, Complaints, Feedbacks, Notices, and Mess System
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ----------------------------------------------------
// 1. USER SCHEMA
// ----------------------------------------------------
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['STUDENT', 'STAFF', 'ADMIN', 'WARDEN'],
      default: 'STUDENT',
    },
    // Student specifics
    hostelBlock: { type: String },
    roomNumber: { type: String },
    rollNumber: { type: String, sparse: true, unique: true },
    // Staff specifics
    specialization: {
      type: String,
      enum: ['PLUMBING', 'ELECTRICITY', 'WIFI', 'MESS_FOOD', 'CLEANING', 'SECURITY', 'OTHERS'],
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 2. COMPLAINT SCHEMA
// ----------------------------------------------------
const ComplaintSchema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true }, // e.g. "SH-2026-9821"
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['PLUMBING', 'ELECTRICITY', 'WIFI', 'MESS_FOOD', 'CLEANING', 'SECURITY', 'OTHERS'],
      required: true,
    },
    urgency: {
      type: String,
      enum: ['NORMAL', 'URGENT', 'EMERGENCY'],
      default: 'NORMAL',
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'],
      default: 'PENDING',
    },
    isAnonymous: { type: Boolean, default: false },
    roomNumber: { type: String, required: true },
    hostelBlock: { type: String, required: true },
    
    // Attachments
    attachments: [{ type: String }], // Array of uploaded media URLs
    
    // Resolution Verification Proof
    resolutionProof: { type: String }, // Mandatory photo proof before RESOLVED state
    resolutionNotes: { type: String },
    resolvedAt: { type: Date },

    // Staff Assignment
    assignedStaff: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedStaffName: { type: String },
    assignedStaffPhone: { type: String },

    // Student reference
    student: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 3. FEEDBACK SCHEMA
// ----------------------------------------------------
const FeedbackSchema = new Schema(
  {
    complaint: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, unique: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 4. NOTICE SCHEMA
// ----------------------------------------------------
const NoticeSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'GENERAL' },
    isPinned: { type: Boolean, default: false },
    targetBlock: { type: String }, // null = all blocks
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// ----------------------------------------------------
// 5. MESS MENU & FEEDBACK SCHEMA
// ----------------------------------------------------
const MessMenuSchema = new Schema(
  {
    date: { type: Date, required: true },
    mealType: { type: String, enum: ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'], required: true },
    items: [{ type: String, required: true }],
  },
  { timestamps: true }
);

MessMenuSchema.index({ date: 1, mealType: 1 }, { unique: true });

const MessFeedbackSchema = new Schema(
  {
    messMenu: { type: Schema.Types.ObjectId, ref: 'MessMenu', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isLiked: { type: Boolean, required: true }, // Thumbs up (true) / Thumbs down (false)
    comment: { type: String },
  },
  { timestamps: true }
);

MessFeedbackSchema.index({ messMenu: 1, student: 1 }, { unique: true });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Complaint: mongoose.model('Complaint', ComplaintSchema),
  Feedback: mongoose.model('Feedback', FeedbackSchema),
  Notice: mongoose.model('Notice', NoticeSchema),
  MessMenu: mongoose.model('MessMenu', MessMenuSchema),
  MessFeedback: mongoose.model('MessFeedback', MessFeedbackSchema),
};
