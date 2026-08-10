const { Client } = require('pg');

const DB_URL = "postgresql://akansh:ex19f2XS4KkMOyi8SUQNdQ@low-mole-19506.jxf.gcp-asia-south1.cockroachlabs.cloud:26257/sunohostelprod?sslmode=verify-full";

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const body = event.body ? JSON.parse(event.body) : {};

    // 1. EXISTING STUDENT LOGIN & DATABASE MATCH VERIFICATION
    if (event.path.includes('login')) {
      const email = body.email ? body.email.trim() : '';
      const password = body.password ? body.password.trim() : '';

      const res = await client.query(`
        SELECT * FROM users WHERE LOWER(email) = LOWER($1);
      `, [email]);

      await client.end();

      if (res.rows.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: "account not found in database" })
        };
      }

      const user = res.rows[0];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, user })
      };
    }

    // 2. NEW STUDENT REGISTER WITH DUPLICATE EMAIL & PHONE CHECK
    if (event.path.includes('register-sync') || event.path.includes('api')) {
      const name = body.name || 'Student User';
      const roomNumber = body.roomNumber || '304';
      const hostelBlock = body.hostelBlock || 'Boys Una Hostel 1';
      const role = body.role || 'STUDENT';
      const email = body.email ? body.email.trim() : '';
      const phone = body.phone ? body.phone.trim() : '';

      // Check duplicate Email or Phone Number in CockroachDB
      if (email || phone) {
        const checkRes = await client.query(`
          SELECT email, phone FROM users WHERE LOWER(email) = LOWER($1) OR phone = $2;
        `, [email, phone]);

        if (checkRes.rows.length > 0) {
          const matched = checkRes.rows[0];
          await client.end();
          if (matched.email && matched.email.toLowerCase() === email.toLowerCase()) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ success: false, error: "this email is already registered" })
            };
          }
          if (matched.phone && matched.phone === phone) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ success: false, error: "this phone number is already registered" })
            };
          }
        }
      }

      const rollNumber = '2026' + Math.floor(1000 + Math.random() * 9000);

      const res = await client.query(`
        INSERT INTO users (name, email, phone, passwordHash, role, hostelBlock, roomNumber, rollNumber)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `, [name, email, phone, 'pass_123', role, hostelBlock, roomNumber, rollNumber]);

      await client.end();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, user: res.rows[0] })
      };
    }

    await client.end();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "Netlify CockroachDB API Active" })
    };
  } catch (err) {
    console.error("Netlify Function DB Error:", err);
    try { await client.end(); } catch (e) {}
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
