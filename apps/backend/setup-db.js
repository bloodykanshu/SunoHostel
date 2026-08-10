const { Client } = require('pg');

const connectionString = "postgresql://akansh:ex19f2XS4KkMOyi8SUQNdQ@low-mole-19506.jxf.gcp-asia-south1.cockroachlabs.cloud:26257/sunohostelprod?sslmode=verify-full";

const client = new Client({ connectionString });

async function initDB() {
  try {
    await client.connect();
    console.log("Connected to CockroachDB 10 GB Free Cluster successfully! 🚀");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING NOT NULL,
        email STRING UNIQUE NOT NULL,
        phone STRING UNIQUE NOT NULL,
        passwordHash STRING NOT NULL,
        role STRING DEFAULT 'STUDENT',
        hostelBlock STRING,
        roomNumber STRING,
        rollNumber STRING UNIQUE,
        specialization STRING,
        createdAt TIMESTAMPTZ DEFAULT now(),
        updatedAt TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS complaints (
        id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
        ticketId STRING UNIQUE NOT NULL,
        title STRING NOT NULL,
        description STRING NOT NULL,
        category STRING NOT NULL,
        urgency STRING DEFAULT 'NORMAL',
        status STRING DEFAULT 'PENDING',
        isAnonymous BOOLEAN DEFAULT false,
        roomNumber STRING NOT NULL,
        hostelBlock STRING NOT NULL,
        attachments STRING[],
        resolutionProof STRING,
        resolutionNotes STRING,
        resolvedAt TIMESTAMPTZ,
        createdAt TIMESTAMPTZ DEFAULT now(),
        updatedAt TIMESTAMPTZ DEFAULT now(),
        studentId STRING REFERENCES users(id) ON DELETE SET NULL,
        assignedStaffId STRING REFERENCES users(id) ON DELETE SET NULL,
        assignedStaffName STRING,
        assignedStaffPhone STRING
      );

      CREATE TABLE IF NOT EXISTS feedbacks (
        id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
        rating INT8 NOT NULL,
        comment STRING,
        createdAt TIMESTAMPTZ DEFAULT now(),
        complaintId STRING UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
        studentId STRING REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notices (
        id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
        title STRING NOT NULL,
        content STRING NOT NULL,
        category STRING DEFAULT 'GENERAL',
        isPinned BOOLEAN DEFAULT false,
        targetBlock STRING,
        createdAt TIMESTAMPTZ DEFAULT now(),
        updatedAt TIMESTAMPTZ DEFAULT now(),
        authorId STRING REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS mess_menus (
        id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        mealType STRING NOT NULL,
        items STRING[] NOT NULL,
        createdAt TIMESTAMPTZ DEFAULT now(),
        UNIQUE (date, mealType)
      );

      CREATE TABLE IF NOT EXISTS mess_feedbacks (
        id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
        isLiked BOOLEAN NOT NULL,
        comment STRING,
        createdAt TIMESTAMPTZ DEFAULT now(),
        messMenuId STRING REFERENCES mess_menus(id) ON DELETE CASCADE,
        studentId STRING REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (messMenuId, studentId)
      );
    `);

    console.log("All CockroachDB Database Tables Created & Synced Successfully! ✅");
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    await client.end();
  }
}

initDB();
