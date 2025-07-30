import mongoose, { Schema } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const ObjectId = mongoose.Types.ObjectId;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected", process.env.MONGO_URI);
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

const userSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String,
});

const adminSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String,
});

const courseSchema = new Schema({
    title: String,
    description: String,
    price: String,
    imageUrl: String,
    creatorId: ObjectId,
});

const purchaseSchema = new Schema({
    courseId: ObjectId,
    userId: ObjectId
});

const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);

export default connectDB;
export { userModel, adminModel, courseModel, purchaseModel }

