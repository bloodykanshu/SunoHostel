const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://rinshuyadav3_db_user:Akansh%401234@sunohostel.2sasybh.mongodb.net/sunohostel?retryWrites=true&w=majority&appName=Sunohostel";

let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedDb = client.db('sunohostel');
  console.log("⚡ Connected to MongoDB Atlas Cloud");
  return cachedDb;
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 1. EXISTING STUDENT LOGIN & EXACT PASSWORD VERIFICATION
app.post('/api/login', async (req, res) => {
  try {
    const db = await getDb();
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password ? req.body.password.trim() : '';

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: "account not found in database" });
    }

    const storedPassword = user.passwordHash || user.password;

    if (storedPassword && storedPassword !== password) {
      return res.status(401).json({ success: false, error: "invalid password" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. FETCH ALL COMPLAINTS FOR WARDEN & TRACKER
app.get('/api/complaints', async (req, res) => {
  try {
    const db = await getDb();
    const complaintsDocs = await db.collection('complaints').find({}).sort({ createdAt: -1 }).toArray();

    const complaints = complaintsDocs.map(r => ({
      id: r.ticketId || r._id.toString(),
      title: r.title,
      description: r.description || '',
      category: r.category,
      room: r.roomNumber,
      block: r.hostelBlock,
      urgency: r.urgency,
      status: r.status || 'PENDING',
      staff: r.assignedStaff,
      isAnon: r.isAnonymous,
      studentName: r.isAnonymous ? 'Anonymous Student' : (r.studentName || 'Student'),
      supports: r.supports || (r.upvotedBy ? r.upvotedBy.length : 0),
      opposes: r.opposes || (r.downvotedBy ? r.downvotedBy.length : 0),
      upvotedBy: r.upvotedBy || [],
      downvotedBy: r.downvotedBy || []
    }));

    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SUBMIT NEW COMPLAINT TO MONGODB
app.post('/api/complaints', async (req, res) => {
  try {
    const db = await getDb();
    const ticketId = req.body.ticketId || ('SH-2026-' + Math.floor(1000 + Math.random() * 9000));
    const title = req.body.title || 'General Complaint';
    const description = req.body.description || '';
    const category = req.body.category || 'OTHERS';
    const urgency = req.body.urgency || 'NORMAL';
    const roomNumber = req.body.roomNumber || '304';
    const hostelBlock = req.body.hostelBlock || 'Boys Una Hostel 1';
    const isAnonymous = req.body.isAnonymous || false;

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
      supports: 0,
      opposes: 0,
      upvotedBy: [],
      downvotedBy: [],
      createdAt: new Date()
    };

    await db.collection('complaints').insertOne(newComplaint);
    res.json({ success: true, complaint: newComplaint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. VOTE ON COMPLAINT (SUPPORT OR OPPOSE)
app.post('/api/vote-complaint', async (req, res) => {
  try {
    const db = await getDb();
    const { ticketId, voteType, userEmail } = req.body;
    if (!ticketId || !voteType || !userEmail) {
      return res.status(400).json({ success: false, error: "missing parameters" });
    }

    const complaint = await db.collection('complaints').findOne({ ticketId });
    if (!complaint) {
      return res.status(404).json({ success: false, error: "complaint not found" });
    }

    let upvotedBy = complaint.upvotedBy || [];
    let downvotedBy = complaint.downvotedBy || [];

    const hasUpvoted = upvotedBy.includes(userEmail);
    const hasDownvoted = downvotedBy.includes(userEmail);

    if (voteType === 'SUPPORT') {
      if (hasUpvoted) {
        upvotedBy = upvotedBy.filter(e => e !== userEmail);
      } else {
        upvotedBy.push(userEmail);
        if (hasDownvoted) {
          downvotedBy = downvotedBy.filter(e => e !== userEmail);
        }
      }
    } else if (voteType === 'OPPOSE') {
      if (hasDownvoted) {
        downvotedBy = downvotedBy.filter(e => e !== userEmail);
      } else {
        downvotedBy.push(userEmail);
        if (hasUpvoted) {
          upvotedBy = upvotedBy.filter(e => e !== userEmail);
        }
      }
    }

    const supportsCount = upvotedBy.length;
    const opposesCount = downvotedBy.length;

    await db.collection('complaints').updateOne(
      { ticketId },
      {
        $set: {
          supports: supportsCount,
          opposes: opposesCount,
          upvotedBy,
          downvotedBy
        }
      }
    );

    res.json({
      success: true,
      ticketId,
      supports: supportsCount,
      opposes: opposesCount,
      upvotedBy,
      downvotedBy
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UPDATE COMPLAINT STATUS OR ASSIGN STAFF
app.post('/api/update-ticket', async (req, res) => {
  try {
    const db = await getDb();
    const { ticketId, status, staff } = req.body;
    const updateFields = {};
    if (status) updateFields.status = status;
    if (staff) updateFields.assignedStaff = staff;

    await db.collection('complaints').updateOne(
      { ticketId },
      { $set: updateFields }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. NEW STUDENT REGISTER WITH ACTUAL PASSWORD & DUPLICATE CHECKS
app.post('/api/register-sync', async (req, res) => {
  try {
    const db = await getDb();
    const usersCol = db.collection('users');

    const name = req.body.name || 'Student User';
    const roomNumber = req.body.roomNumber || '304';
    const hostelBlock = req.body.hostelBlock || 'Boys Una Hostel 1';
    const role = req.body.role || 'STUDENT';
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const phone = req.body.phone ? req.body.phone.trim() : '';
    const password = req.body.password ? req.body.password.trim() : 'pass_123';

    if (email || phone) {
      const existingEmail = await usersCol.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, error: "this email is already registered" });
      }

      const existingPhone = await usersCol.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ success: false, error: "this phone number is already registered" });
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
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all fallback middleware to serve index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SunoHostel Server running on port ${PORT}`);
});
