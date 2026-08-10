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

    // 1. EXISTING STUDENT LOGIN & EXACT PASSWORD VERIFICATION
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
      const storedPassword = user.passwordhash || user.password;

      if (storedPassword && storedPassword !== password) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: "invalid password" })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, user })
      };
    }

    // 2. FETCH ALL COMPLAINTS FOR WARDEN & TRACKER
    if (event.path.includes('complaints') && event.httpMethod === 'GET') {
      const res = await client.query(`
        SELECT * FROM complaints ORDER BY createdAt DESC;
      `);
      await client.end();

      const complaints = res.rows.map(r => ({
        id: r.ticketid || r.id,
        title: r.title,
        category: r.category,
        room: r.roomnumber,
        block: r.hostelblock,
        urgency: r.urgency,
        status: r.status,
        staff: r.assignedstaff,
        isAnon: r.isanonymous,
        studentName: r.isanonymous ? 'Anonymous Student' : 'Student'
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, complaints })
      };
    }

    // 3. SUBMIT NEW COMPLAINT TO COCKROACHDB
    if (event.path.includes('complaints') && event.httpMethod === 'POST') {
      const ticketId = body.ticketId || ('SH-2026-' + Math.floor(1000 + Math.random() * 9000));
      const title = body.title || 'General Complaint';
      const description = body.description || '';
      const category = body.category || 'OTHERS';
      const urgency = body.urgency || 'NORMAL';
      const roomNumber = body.roomNumber || '304';
      const hostelBlock = body.hostelBlock || 'Boys Una Hostel 1';
      const isAnonymous = body.isAnonymous || false;

      const res = await client.query(`
        INSERT INTO complaints (ticketId, title, description, category, urgency, roomNumber, hostelBlock, isAnonymous, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
        RETURNING *;
      `, [ticketId, title, description, category, urgency, roomNumber, hostelBlock, isAnonymous]);

      await client.end();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, complaint: res.rows[0] })
      };
    }

    // 4. UPDATE COMPLAINT STATUS OR ASSIGN STAFF
    if (event.path.includes('update-ticket')) {
      const { ticketId, status, staff } = body;
      await client.query(`
        UPDATE complaints SET status = COALESCE($1, status), assignedStaff = COALESCE($2, assignedStaff)
        WHERE ticketId = $3;
      `, [status, staff, ticketId]);

      await client.end();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    // 5. NEW STUDENT REGISTER WITH ACTUAL PASSWORD & DUPLICATE CHECKS
    if (event.path.includes('register-sync') || event.path.includes('api')) {
      const name = body.name || 'Student User';
      const roomNumber = body.roomNumber || '304';
      const hostelBlock = body.hostelBlock || 'Boys Una Hostel 1';
      const role = body.role || 'STUDENT';
      const email = body.email ? body.email.trim() : '';
      const phone = body.phone ? body.phone.trim() : '';
      const password = body.password ? body.password.trim() : 'pass_123';

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
      `, [name, email, phone, password, role, hostelBlock, roomNumber, rollNumber]);

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
