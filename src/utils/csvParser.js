const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');

/**
 * Parse a CSV or Excel buffer into rows.
 * Returns an array of plain objects keyed by header names.
 *
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @returns {Array<Object>}
 */
function parseFileToRows(fileBuffer, originalName) {
  const lower = originalName.toLowerCase();

  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet, { defval: '' });
  }

  // Default to CSV
  const text = fileBuffer.toString('utf-8');
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  return records;
}

module.exports = {
  parseFileToRows
};


