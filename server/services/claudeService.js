const axios = require('axios');
const fs = require('fs');
const mime = require('mime-types');

require('dotenv').config();

const extractEngineeringDataFromImage = async (imagePath) => {
  const imageBuffer = fs.readFileSync(imagePath);

  const base64Image = imageBuffer.toString('base64');

  const mediaType = mime.lookup(imagePath);

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `
You are an engineering document parser.

Analyze this engineering document carefully.

Extract ONLY valid JSON.

Schema:

{
  "tag_no": "",
  "item_name": "",
  "quantity": "",
  "project": "",
  "plate_material": "",
  "flange_material": "",
  "flange_type": "",
  "flow_rate_unit": "",
  "pressure_unit": "",
  "temp_unit": "",
  "density_unit": "",
  "viscosity_unit": "",
  "gasket": "",
  "jackbolt": "",
  "pipe_material": "",
  "size_in_nps_or_dn": "",
  "flange_schedule": "",
  "rj_holder_material": "",
  "bore_type": ""
}

Return ONLY JSON.
              `,
            },
          ],
        },
      ],
    },
    {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    }
  );

  const output = response.data.content[0].text;

  return JSON.parse(output);
};

module.exports = {
  extractEngineeringDataFromImage,
};