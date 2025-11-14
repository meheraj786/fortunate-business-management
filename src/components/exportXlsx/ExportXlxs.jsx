import * as XLSX from "xlsx";

export const exportToExcel = (data, fileName = "data.xlsx", sheetName = "Sheet1") => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, fileName);
};
