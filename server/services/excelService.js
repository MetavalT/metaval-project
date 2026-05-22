const XLSX = require('xlsx');

const exportToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const filePath = "./data.xlsx";
  XLSX.writeFile(workbook, filePath);

  return filePath;
};

module.exports = { exportToExcel };