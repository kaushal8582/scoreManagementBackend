const User = require('../models/User');
const { parseFileToRows } = require('../utils/csvParser');

/**
 * Bulk create users from CSV/Excel upload.
 * Enforces unique fullName; duplicates are skipped and reported.
 *
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @returns {{ created: number, skipped: Array<{ row: any, reason: string }>}}
 */
async function uploadUsersFromFile(fileBuffer, originalName) {
  const rows = parseFileToRows(fileBuffer, originalName);
  const skipped = [];
  let created = 0;

  for (const row of rows) {
    const firstName = (row['First Name'] || row.firstName || '').trim();
    const lastName = (row['Last Name'] || row.lastName || '').trim();
    const category = (row['Category'] || row.category || '').trim();

    if (!firstName || !lastName) {
      skipped.push({ row, reason: 'Missing firstName or lastName' });
      continue;
    }

    const fullName = `${firstName} ${lastName}`;
    const exists = await User.findOne({ fullName });
    if (exists) {
      skipped.push({ row, reason: 'Duplicate fullName' });
      continue;
    }

    await User.create({
      firstName,
      lastName,
      fullName,
      category,
      // email/password not available in bulk upload; can be filled later
      email: `${firstName}.${lastName}.${Date.now()}@placeholder.local`,
      password: 'placeholder-hash'
    });
    created += 1;
  }

  return { created, skipped };
}

async function listUsers() {
  return User.find().populate('teamId', 'name').sort({ createdAt: -1 });
}

module.exports = {
  uploadUsersFromFile,
  listUsers
};


