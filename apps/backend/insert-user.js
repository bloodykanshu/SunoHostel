const { Client } = require('pg');

const connectionString = "postgresql://akansh:ex19f2XS4KkMOyi8SUQNdQ@low-mole-19506.jxf.gcp-asia-south1.cockroachlabs.cloud:26257/sunohostelprod?sslmode=verify-full";

const client = new Client({ connectionString });

async function insertTestUser() {
  try {
    await client.connect();
    console.log("Connecting to CockroachDB...");

    const res = await client.query(`
      INSERT INTO users (name, email, phone, passwordHash, role, hostelBlock, roomNumber, rollNumber)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `, ['Rahul Sharma', 'rahul.sharma@sunohostel.edu', '+91 9876543210', 'hashed_pass_123', 'STUDENT', 'Boys Diu Hostel', '304', '2026CS104']);

    console.log("Inserted User Row in CockroachDB:", res.rows);
  } catch (err) {
    console.error("Insert Error:", err);
  } finally {
    await client.end();
  }
}

insertTestUser();
