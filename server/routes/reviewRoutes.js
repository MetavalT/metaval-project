const express = require('express');

const router = express.Router();

const {
  getPendingReviews,
  getReviewById,
  approveReview,
  rejectReview,
} = require('../controllers/reviewController');


// ======================================
// GET PENDING REVIEWS
// ======================================

router.get(
  '/pending',
  getPendingReviews
);


// ======================================
// GET SINGLE REVIEW
// ======================================

router.get(
  '/:id',
  getReviewById
);


// ======================================
// APPROVE REVIEW
// ======================================

router.post(
  '/approve/:id',
  approveReview
);


// ======================================
// REJECT REVIEW
// ======================================

router.post(
  '/reject/:id',
  rejectReview
);


module.exports = router;