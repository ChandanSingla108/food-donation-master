import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: true
    },
    foodTag: {
        type: String,
        enum: ['veg', 'non-veg'],
        default: 'veg'
    },
    quantity: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    donorName: {
        type: String,
        default: "Anonymous"
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'completed'],
        default: 'available'
    },
    reservedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Create a geospatial index for location based queries
foodSchema.index({ location: '2dsphere' });

const Food = mongoose.model('Food', foodSchema);

export default Food;
