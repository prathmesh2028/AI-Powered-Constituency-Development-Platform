import mongoose from "mongoose";
import config from "./config/index.js";
import connectDB from "./config/db.js";

// A temporary schema to force database and collection creation
const dummySchema = new mongoose.Schema({
  name: String,
  initializedAt: { type: Date, default: Date.now }
}, { collection: "system_initialization" });

const DummyModel = mongoose.model("SystemInitialization", dummySchema);

const initializeClusterDatabase = async () => {
  try {
    console.log("Connecting to MongoDB Atlas cluster...");
    await connectDB();

    console.log("Writing initialization document to trigger database creation...");
    
    // Deleting any existing init doc to start fresh
    await DummyModel.deleteMany({});
    
    // Creating one document will force Atlas to create the 'constituency-platform' database
    const doc = await DummyModel.create({
      name: "Constituency Platform Initializer"
    });

    console.log("--------------------------------------------------");
    console.log(`🎉 Success! MongoDB Atlas database initialized.`);
    console.log(`Database Name: 'constituency-platform'`);
    console.log(`Collection Created: 'system_initialization'`);
    console.log(`Document ID: ${doc._id}`);
    console.log("--------------------------------------------------");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Initialization failed:", error.message);
    process.exit(1);
  }
};

initializeClusterDatabase();
