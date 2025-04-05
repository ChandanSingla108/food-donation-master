import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: true,
    },
    foodTag: {
        type: String,
        required: true,
        enum: ['veg', 'nonveg']
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });

const Food = mongoose.model("Food", foodSchema);

export default Food;
