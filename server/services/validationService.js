const validateEngineeringData = (data) => {
  const errors = [];

  if (!data.tag_no) {
    errors.push('Tag Number is required');
  }

  if (!data.plate_material) {
    errors.push('Plate Material is required');
  }

  if (!data.pressure_unit) {
    errors.push('Pressure Unit is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateEngineeringData,
};