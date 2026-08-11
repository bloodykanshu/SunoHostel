const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://rinshuyadav3_db_user:Akansh%401234@sunohostel.2sasybh.mongodb.net/sunohostel?retryWrites=true&w=majority&appName=Sunohostel";

async function seedAdmin() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('sunohostel');
    const usersCol = db.collection('users');

    const adminData = {
      name: "Vikas",
      email: "vikas.kumar@iiitvadodara.ac.in",
      phone: "+91 99000 11223",
      passwordHash: "Diu@kevdi@vikas",
      role: "ADMIN",
      hostelBlock: "All Hostels (Chief Warden)",
      createdAt: new Date()
    };

    await usersCol.updateOne(
      { email: "vikas.kumar@iiitvadodara.ac.in" },
      { $set: adminData },
      { upsert: true }
    );

    await usersCol.updateOne(
      { email: "vikas" },
      { $set: { ...adminData, email: "vikas" } },
      { upsert: true }
    );

    console.log("✅ SUCCESS: Admin user Vikas (vikas.kumar@iiitvadodara.ac.in) updated in MongoDB Atlas!");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await client.close();
  }
}

seedAdmin();
