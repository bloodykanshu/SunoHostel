const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://rinshuyadav3_db_user:Akansh%401234@sunohostel.2sasybh.mongodb.net/sunohostel?retryWrites=true&w=majority&appName=Sunohostel";

async function seedAdmin() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('sunohostel');
    const usersCol = db.collection('users');

    await usersCol.updateOne(
      { email: "vikas" },
      {
        $set: {
          name: "Vikas",
          email: "vikas",
          phone: "+91 99000 11223",
          passwordHash: "Diu@kevdi@vikas",
          role: "ADMIN",
          hostelBlock: "All Hostels (Chief Warden)",
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log("✅ SUCCESS: Admin user Vikas (Diu@kevdi@vikas) saved in MongoDB Atlas users collection!");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await client.close();
  }
}

seedAdmin();
