const pdf = require('pdf-poppler');
const path = require('path');

const convertPDFToImages = async (pdfPath) => {
  const outputDir = path.join(__dirname, '../uploads/output');

  const opts = {
    format: 'png',
    out_dir: outputDir,
    out_prefix: 'page',
    page: null,
  };

  await pdf.convert(pdfPath, opts);

  return outputDir;
};

module.exports = {
  convertPDFToImages,
};