const { Client } = require('pg');

const connectionString = "postgresql://akansh:ex19f2XS4KkMOyi8SUQNdQ@low-mole-19506.jxf.gcp-asia-south1.cockroachlabs.cloud:26257/sunohostelprod?sslmode=verify-full";

const client = new Client({ connectionString });

async function insertUser() {
  try {
    await client.connect();
    console.log("Inserting Akansh Yadavv into CockroachDB...");

    const res = await client.query(`
      INSERT INTO users (name, email, phone, passwordHash, role, hostelBlock, roomNumber, rollNumber)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `, ['Akansh Yadavv', 'akansh.yadavv@sunohostel.edu', '+91 9999888877', 'hashed_pass_akansh', 'STUDENT', 'Boys Una Hostel 1', '102', '2026CS102']);

    console.log("Successfully Inserted Akansh Yadavv in CockroachDB:", res.rows);
  } catch (err) {
    console.error("Insert Error:", err);
  } finally {
    await client.end();
  }
}

insertUser();
