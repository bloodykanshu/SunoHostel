const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || "postgresql://akansh:ex19f2XS4KkMOyi8SUQNdQ@low-mole-19506.jxf.gcp-asia-south1.cockroachlabs.cloud:26257/sunohostelprod?sslmode=verify-full";

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

  const client = new Client({ connectionString: DB_URL });

  try {
    await client.connect();
    const path = event.path;
    const body = event.body ? JSON.parse(event.body) : {};

    if (path.includes('/register-sync') && event.httpMethod === 'POST') {
      const { name, roomNumber, hostelBlock, role } = body;
      const email = (name || 'user').toLowerCase().replace(/\s+/g, '') + '@sunohostel.edu';
      const phone = '+91 ' + Math.floor(1000000000 + Math.random() * 9000000000);
      const rollNumber = '2026' + Math.floor(100 + Math.random() * 900);

      const res = await client.query(`
        INSERT INTO users (name, email, phone, passwordHash, role, hostelBlock, roomNumber, rollNumber)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, roomNumber = EXCLUDED.roomNumber
        RETURNING *;
      `, [name || 'Student', email, phone, 'pass_123', role || 'STUDENT', hostelBlock || 'Boys Una Hostel 1', roomNumber || '101', rollNumber]);

      await client.end();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, user: res.rows[0] })
      };
    }

    if (path.includes('/complaints') && event.httpMethod === 'POST') {
      const { ticketId, title, description, category, urgency, roomNumber, hostelBlock } = body;
      const res = await client.query(`
        INSERT INTO complaints (ticketId, title, description, category, urgency, roomNumber, hostelBlock)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `, [ticketId || 'SH-2026-9999', title || 'Issue', description || 'Desc', category || 'OTHERS', urgency || 'NORMAL', roomNumber || '101', hostelBlock || 'Boys Una Hostel 1']);

      await client.end();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, complaint: res.rows[0] })
      };
    }

    await client.end();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "SunoHostel Netlify Database API Active", status: "OK" })
    };
  } catch (err) {
    console.error("Netlify Function Error:", err);
    try { await client.end(); } catch (e) {}
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
