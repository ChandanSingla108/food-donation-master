import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterEmail: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: "I would like to request this food donation"
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending"
  },
  requestDate: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const foodSchema = new mongoose.Schema(
  {
    foodName: {
      type: String,
      required: true,
    },
    foodTag: {
      type: String,
      enum: ["veg", "non-veg"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    donorName: {
      type: String
    },
    status: {
      type: String,
      enum: ["available", "reserved", "completed"],
      default: "available"
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    requests: [requestSchema],
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Create a geospatial index on the location field
foodSchema.index({ location: "2dsphere" });

const Food = mongoose.model("Food", foodSchema);

export default Food;
