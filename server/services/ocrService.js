const Tesseract = require('tesseract.js');

const extractTextFromImage = async (imagePath) => {
  const result = await Tesseract.recognize(
    imagePath,
    'eng',
    {
      logger: m => console.log(m),
    }
  );

  return result.data.text;
};

module.exports = {
  extractTextFromImage,
};