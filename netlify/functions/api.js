const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://rinshuyadav3_db_user:pb87d013WKdxct0c@sunohostel.2sasybh.mongodb.net/sunohostel?retryWrites=true&w=majority&appName=Sunohostel";

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('sunohostel');

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { db } = await connectToDatabase();
    const body = event.body ? JSON.parse(event.body) : {};

    const usersCol = db.collection('users');
    const complaintsCol = db.collection('complaints');

    // 1. EXISTING STUDENT LOGIN & EXACT PASSWORD VERIFICATION
    if (event.path.includes('login')) {
      const email = body.email ? body.email.trim().toLowerCase() : '';
      const password = body.password ? body.password.trim() : '';

      const user = await usersCol.findOne({ email });

      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: "account not found in database" })
        };
      }

      const storedPassword = user.passwordHash || user.password;

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
      const complaintsDocs = await complaintsCol.find({}).sort({ createdAt: -1 }).toArray();

      const complaints = complaintsDocs.map(r => ({
        id: r.ticketId || r._id.toString(),
        title: r.title,
        category: r.category,
        room: r.roomNumber,
        block: r.hostelBlock,
        urgency: r.urgency,
        status: r.status || 'PENDING',
        staff: r.assignedStaff,
        isAnon: r.isAnonymous,
        studentName: r.isAnonymous ? 'Anonymous Student' : (r.studentName || 'Student')
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, complaints })
      };
    }

    // 3. SUBMIT NEW COMPLAINT TO MONGODB
    if (event.path.includes('complaints') && event.httpMethod === 'POST') {
      const ticketId = body.ticketId || ('SH-2026-' + Math.floor(1000 + Math.random() * 9000));
      const title = body.title || 'General Complaint';
      const description = body.description || '';
      const category = body.category || 'OTHERS';
      const urgency = body.urgency || 'NORMAL';
      const roomNumber = body.roomNumber || '304';
      const hostelBlock = body.hostelBlock || 'Boys Una Hostel 1';
      const isAnonymous = body.isAnonymous || false;

      const newComplaint = {
        ticketId,
        title,
        description,
        category,
        urgency,
        roomNumber,
        hostelBlock,
        isAnonymous,
        status: 'PENDING',
        createdAt: new Date()
      };

      await complaintsCol.insertOne(newComplaint);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, complaint: newComplaint })
      };
    }

    // 4. UPDATE COMPLAINT STATUS OR ASSIGN STAFF
    if (event.path.includes('update-ticket')) {
      const { ticketId, status, staff } = body;
      const updateFields = {};
      if (status) updateFields.status = status;
      if (staff) updateFields.assignedStaff = staff;

      await complaintsCol.updateOne(
        { ticketId },
        { $set: updateFields }
      );

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
      const email = body.email ? body.email.trim().toLowerCase() : '';
      const phone = body.phone ? body.phone.trim() : '';
      const password = body.password ? body.password.trim() : 'pass_123';

      if (email || phone) {
        const existingEmail = await usersCol.findOne({ email });
        if (existingEmail) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: "this email is already registered" })
          };
        }

        const existingPhone = await usersCol.findOne({ phone });
        if (existingPhone) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: "this phone number is already registered" })
          };
        }
      }

      const rollNumber = '2026' + Math.floor(1000 + Math.random() * 9000);

      const newUser = {
        name,
        email,
        phone,
        passwordHash: password,
        role,
        hostelBlock,
        roomNumber,
        rollNumber,
        createdAt: new Date()
      };

      await usersCol.insertOne(newUser);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, user: newUser })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "Netlify MongoDB Atlas API Active" })
    };
  } catch (err) {
    console.error("Netlify Function MongoDB Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
