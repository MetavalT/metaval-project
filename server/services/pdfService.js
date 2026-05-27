const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const pdfPoppler = require("pdf-poppler");

/**
 * Extracts raw textual data from digital or scanned image PDFs.
 * @param {string} filePath - Absolute path to uploaded temp document asset.
 * @returns {Promise<string>} Cleaned extracted raw string text.
 */
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  let extractedText = pdfData.text.trim();

  // Scanned Document Fallback Loop via Tesseract OCR Engine Subsystem
  if (!extractedText || extractedText.length < 20) {
    console.log("⚙️ Scanned Document Detected. Activating OCR Subsystem Engine...");
    const opts = { format: "png", out_dir: "./uploads", out_prefix: "page", page: 1 };
    await pdfPoppler.convert(filePath, opts);
    
    const imagePath = "./uploads/page-1.png";
    const result = await Tesseract.recognize(imagePath, "eng");
    extractedText = result.data.text;
  }

  return extractedText;
};

module.exports = { extractTextFromPDF };