
const db = require('../db');

async function promote(username) {
  if (!username) {
    console.error("Please provide a username: node scripts/promoteAdmin.js <username>");
    process.exit(1);
  }

  try {
    console.log(`Attempting to promote '${username}' to Admin...`);
    
    const query = `
      UPDATE users 
      SET role = 'admin' 
      WHERE username = $1 
      RETURNING id, username, role
    `;
    
    const { rows } = await db.query(query, [username]);

    if (rows.length > 0) {
      console.log("-----------------------------------------");
      console.log(`SUCCESS: User '${rows[0].username}' (ID: ${rows[0].id}) is now an ${rows[0].role.toUpperCase()}.`);
      console.log("-----------------------------------------");
    } else {
      console.error(`ERROR: User '${username}' not found in the database.`);
    }
  } catch (error) {
    console.error("FAILED to promote user:", error.message);
  } finally {

    process.exit();
  }
}

const targetUsername = process.argv[2];
promote(targetUsername);