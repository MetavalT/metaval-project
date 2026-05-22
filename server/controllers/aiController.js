const pool = require('../config/db');

const { extractTextFromPDF } = require('../services/pdfService');

const {
  extractEngineeringData,
  extractEngineeringDataFromImage,
} = require('../services/claudeService');

const {
  normalizeValue,
} = require('../services/normalizationService');

const {
  validateEngineeringData,
} = require('../services/validationService');

const {
  extractTextFromImage,
} = require('../services/ocrService');

const {
  convertPDFToImages,
} = require('../services/pdfToImageService');

const fs = require('fs');
const path = require('path');

const uploadAndProcessPDF = async (req, res) => {
  try {

    // ================================
    // CHECK FILE
    // ================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded',
      });
    }

    const filePath = req.file.path;
      console.log('PDF FILE PATH:', filePath);
    // ================================
    // STEP 1 — NORMAL PDF EXTRACTION
    // ================================

    let extractedText = '';

    try {
      extractedText = await extractTextFromPDF(filePath);
    } catch (err) {
      console.log('Regular PDF extraction failed.');
    }
    console.log('EXTRACTED TEXT:');
console.log(extractedText);

    // ================================
    // STEP 2 — OCR FALLBACK
    // ================================

    if (!extractedText || extractedText.trim().length < 50) {

      console.log('Scanned PDF detected. Using OCR.');

      const imageFolder = await convertPDFToImages(filePath);

      const files = fs.readdirSync(imageFolder);

      for (const file of files) {

        const imagePath = path.join(imageFolder, file);

        const pageText = await extractTextFromImage(imagePath);

        extractedText += '\n' + pageText;
      }
    }

    // ================================
    // STEP 3 — CLAUDE TEXT EXTRACTION
    // ================================

    let structuredData = await extractEngineeringData(extractedText);
      console.log('STRUCTURED DATA:');
console.log(structuredData);
    // ================================
    // STEP 4 — CLAUDE VISION EXTRACTION
    // ================================

    try {

      const imageFolder = await convertPDFToImages(filePath);

      const files = fs.readdirSync(imageFolder);

      let visionData = {};

      for (const file of files) {

        const imagePath = path.join(imageFolder, file);

        const extractedVisionData =
          await extractEngineeringDataFromImage(imagePath);

        visionData = {
          ...visionData,
          ...extractedVisionData,
        };
      }

      // Merge Vision Data over Text Data
      structuredData = {
        ...structuredData,
        ...visionData,
      };

    } catch (visionError) {

      console.log(
        'Claude Vision extraction failed:',
        visionError.message
      );
    }

    // ================================
    // STEP 5 — NORMALIZATION
    // ================================

    structuredData.plate_material = await normalizeValue(
      'plate_material',
      structuredData.plate_material
    );

    structuredData.flange_material = await normalizeValue(
      'flange_material',
      structuredData.flange_material
    );

    structuredData.pressure_unit = await normalizeValue(
      'pressure_unit',
      structuredData.pressure_unit
    );

    structuredData.temp_unit = await normalizeValue(
      'temp_unit',
      structuredData.temp_unit
    );

    structuredData.density_unit = await normalizeValue(
      'density_unit',
      structuredData.density_unit
    );

    structuredData.viscosity_unit = await normalizeValue(
      'viscosity_unit',
      structuredData.viscosity_unit
    );

    structuredData.gasket = await normalizeValue(
      'gasket',
      structuredData.gasket
    );

    structuredData.jackbolt = await normalizeValue(
      'jackbolt',
      structuredData.jackbolt
    );

    structuredData.pipe_material = await normalizeValue(
      'pipe_material',
      structuredData.pipe_material
    );

    // ================================
    // STEP 6 — VALIDATION
    // ================================

    const validation = validateEngineeringData(structuredData);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        validation_errors: validation.errors,
      });
    }

    // ================================
// STEP 7 — SAVE TO REVIEW QUEUE
// ================================

const reviewQuery = `
  INSERT INTO review_queue (
    original_filename,
    raw_extracted_json,
    status
  )
  VALUES ($1, $2, $3)
  RETURNING *
`;

const reviewValues = [
  req.file.originalname,
  JSON.stringify(structuredData),
  'PENDING',
];

const reviewResult = await pool.query(
  reviewQuery,
  reviewValues
);
console.log('INSERT VALUES:');
console.log(values);

    // ================================
    // STEP 8 — SUCCESS RESPONSE
    // ================================

    return res.status(200).json({
  success: true,
  message: 'PDF processed and sent for review',
  extracted_data: structuredData,
  review_record: reviewResult.rows[0],
});

  } catch (error) {

    console.error('AI PDF Processing Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
};

module.exports = {
  uploadAndProcessPDF,
};