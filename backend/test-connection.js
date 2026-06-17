const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function showEverything() {
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB Atlas\n");
        console.log("═".repeat(60));

        const conn = mongoose.connection;
        const admin = conn.db.admin();
        const databases = await admin.listDatabases();

        console.log("📁 ALL DATABASES AND COLLECTIONS:\n");

        for (const dbInfo of databases.databases) {
            const dbName = dbInfo.name;

            if (['admin', 'local', 'config'].includes(dbName)) {
                console.log(`📌 ${dbName} (system database - skipped)`);
                continue;
            }

            const db = conn.client.db(dbName);
            const collections = await db.listCollections().toArray();

            console.log(`\n📁 ${dbName} - ${collections.length} collection(s)`);

            for (const coll of collections) {
                const count = await db.collection(coll.name).countDocuments();
                console.log(`   ├── 📄 ${coll.name}: ${count} document(s)`);

                if (count > 0) {
                    console.log(`   │`);
                    const documents = await db.collection(coll.name).find({}).toArray();

                    documents.forEach((doc, index) => {
                        console.log(`   │   📝 Document ${index + 1}:`);
                        console.log(`   │   └── ${JSON.stringify(doc, null, 2).replace(/\n/g, '\n   │       ')}`);
                        console.log(`   │`);
                    });
                }
            }
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected");
    }
}

showEverything();