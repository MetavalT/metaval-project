const pool = require('../config/db');


// ======================================
// GET ALL PENDING REVIEWS
// ======================================

const getPendingReviews = async (req, res) => {
  try {

    const query = `
      SELECT *
      FROM review_queue
      WHERE status = 'PENDING'
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// ======================================
// GET SINGLE REVIEW
// ======================================

const getReviewById = async (req, res) => {
  try {

    const { id } = req.params;

    const query = `
      SELECT *
      FROM review_queue
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// ======================================
// APPROVE REVIEW
// ======================================

const approveReview = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      reviewed_json,
      reviewer_name,
    } = req.body;

    // ======================================
    // GET REVIEW RECORD
    // ======================================

    const reviewQuery = `
      SELECT *
      FROM review_queue
      WHERE id = $1
    `;

    const reviewResult = await pool.query(
      reviewQuery,
      [id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review record not found',
      });
    }

    const data = reviewed_json;

    // ======================================
    // INSERT INTO MAIN TABLE
    // ======================================

    const insertQuery = `
      INSERT INTO ofa_upload (
        tag_no,
        item_name,
        quantity,
        project,
        plate_material,
        flange_material,
        flange_type,
        flow_rate_unit,
        pressure_unit,
        temp_unit,
        density_unit,
        viscosity_unit,
        gasket,
        jackbolt,
        pipe_material,
        size_in_nps_or_dn,
        flange_schedule,
        rj_holder_material,
        bore_type
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      RETURNING *
    `;

    const values = [
      data.tag_no || null,
      data.item_name || null,
      data.quantity || null,
      data.project || null,
      data.plate_material || null,
      data.flange_material || null,
      data.flange_type || null,
      data.flow_rate_unit || null,
      data.pressure_unit || null,
      data.temp_unit || null,
      data.density_unit || null,
      data.viscosity_unit || null,
      data.gasket || null,
      data.jackbolt || null,
      data.pipe_material || null,
      data.size_in_nps_or_dn || null,
      data.flange_schedule || null,
      data.rj_holder_material || null,
      data.bore_type || null,
    ];

    const insertResult = await pool.query(
      insertQuery,
      values
    );

    // ======================================
    // UPDATE REVIEW STATUS
    // ======================================

    const updateQuery = `
      UPDATE review_queue
      SET
        reviewed_json = $1,
        reviewer_name = $2,
        reviewed_at = NOW(),
        status = 'APPROVED'
      WHERE id = $3
    `;

    await pool.query(updateQuery, [
      reviewed_json,
      reviewer_name,
      id,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      inserted_row: insertResult.rows[0],
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// ======================================
// REJECT REVIEW
// ======================================

const rejectReview = async (req, res) => {
  try {

    const { id } = req.params;

    const updateQuery = `
      UPDATE review_queue
      SET
        status = 'REJECTED',
        reviewed_at = NOW()
      WHERE id = $1
    `;

    await pool.query(updateQuery, [id]);

    return res.status(200).json({
      success: true,
      message: 'Review rejected successfully',
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


module.exports = {
  getPendingReviews,
  getReviewById,
  approveReview,
  rejectReview,
};