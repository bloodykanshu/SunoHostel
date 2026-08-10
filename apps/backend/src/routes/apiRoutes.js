/**
 * Express REST API Routes for SunoHostel
 * Includes JWT Auth Middleware, RBAC Guards, and Multer Media Uploader
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const complaintController = require('../controllers/complaintController');

// ----------------------------------------------------
// 1. AUTHENTICATION ROUTES
// ----------------------------------------------------
router.post('/auth/register', (req, res) => {
  res.status(200).json({ success: true, message: 'Student / Staff registration endpoint' });
});

router.post('/auth/login', (req, res) => {
  res.status(200).json({
    success: true,
    token: 'mock-jwt-token-2026',
    user: { id: 'usr-1', name: 'Alex Rivers', role: 'STUDENT', roomNumber: '304' },
  });
});

// ----------------------------------------------------
// 2. COMPLAINT & TICKET MANAGEMENT ROUTES
// ----------------------------------------------------

// [Student] Submit a new complaint (with optional multiple media attachments)
router.post(
  '/complaints',
  authenticateToken,
  authorizeRoles('STUDENT'),
  upload.array('attachments', 3), // Max 3 files
  complaintController.createComplaint
);

// [Student] Get logged-in student's complaints
router.get('/complaints/my-tickets', authenticateToken, (req, res) => {
  req.query.studentId = req.user.id;
  complaintController.getAllComplaints(req, res);
});

// [Admin / Warden] List all complaints with dynamic filters
router.get(
  '/complaints',
  authenticateToken,
  authorizeRoles('ADMIN', 'WARDEN'),
  complaintController.getAllComplaints
);

// [Admin / Warden] Assign ticket to staff with contact details
router.patch(
  '/complaints/:id/assign',
  authenticateToken,
  authorizeRoles('ADMIN', 'WARDEN'),
  complaintController.assignStaff
);

// [Staff / Admin] Mark complaint as RESOLVED with mandatory photo proof
router.patch(
  '/complaints/:id/resolve',
  authenticateToken,
  authorizeRoles('ADMIN', 'WARDEN', 'STAFF'),
  upload.single('resolutionProof'),
  complaintController.resolveComplaint
);

// [Student] Submit 1-5 star rating and comment after resolution
router.post(
  '/complaints/:id/feedback',
  authenticateToken,
  authorizeRoles('STUDENT'),
  complaintController.submitFeedback
);

// [Admin / Warden] Analytics Overview summary statistics
router.get(
  '/analytics/overview',
  authenticateToken,
  authorizeRoles('ADMIN', 'WARDEN'),
  complaintController.getAnalyticsOverview
);

// ----------------------------------------------------
// 3. NOTICE BROADCAST ROUTES
// ----------------------------------------------------

// [All] Get notices
router.get('/notices', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        id: 'not-1',
        title: 'Water Supply Maintenance Schedule',
        content: 'Tank cleaning scheduled for Block-A from 10 AM to 2 PM this Saturday.',
        category: 'MAINTENANCE',
        isPinned: true,
        createdAt: new Date(),
      },
    ],
  });
});

// [Admin / Warden] Create notice broadcast
router.post(
  '/notices',
  authenticateToken,
  authorizeRoles('ADMIN', 'WARDEN'),
  (req, res) => {
    res.status(201).json({ success: true, message: 'Notice broadcasted to all students!' });
  }
);

// ----------------------------------------------------
// 4. MESS MENU & FEEDBACK ROUTES
// ----------------------------------------------------

// [All] Get daily mess menu
router.get('/mess/menu', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      date: new Date(),
      meals: {
        BREAKFAST: ['Puri Bhaji', 'Banana', 'Tea / Coffee'],
        LUNCH: ['Paneer Butter Masala', 'Dal Tadka', 'Jeera Rice', 'Roti'],
        SNACKS: ['Samosa', 'Mint Chutney', 'Tea'],
        DINNER: ['Mix Veg', 'Rasam', 'Rice', 'Gulab Jamun'],
      },
    },
  });
});

// [Student] Vote thumbs up/down on meal
router.post(
  '/mess/vote',
  authenticateToken,
  authorizeRoles('STUDENT'),
  (req, res) => {
    const { isLiked, mealType } = req.body;
    res.status(200).json({
      success: true,
      message: `Feedback recorded! You voted ${isLiked ? 'Thumbs Up 👍' : 'Thumbs Down 👎'} for ${mealType}.`,
    });
  }
);

module.exports = router;
