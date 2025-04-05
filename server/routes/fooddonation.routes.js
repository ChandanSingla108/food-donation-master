import { Router } from "express";

import Food from "../models/food.js";
import User from "../models/user.js";

const router = Router();

// Route to handle food donation form submission - update to use email
router.post("/donateFood", async (req, res) => {
    try {
        console.log("Received donation data:", req.body);
        
        // Extract data from the request body
        const { name, tag, quantity, date, address, email, donorName, location } = req.body;

        // Find the user by email instead of ID
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Create a new food donation with the data
        const food = new Food({
            foodName: name,
            foodTag: tag,
            quantity: Number(quantity),
            expiryDate: date,
            address,
            location: location || {
                type: "Point",
                coordinates: [0, 0] // Default coordinates if none provided
            },
            user: user._id,
            donorName: donorName || user.name
        });

        // Save the food donation to the database
        await food.save();
        
        // Add the food to the user's food array and save
        user.food.push(food._id);
        await user.save();

        res.status(201).json({ 
            success: true, 
            message: "Food donation created successfully", 
            food 
        });
    } catch (error) {
        console.error("Food donation error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to donate food", 
            error: error.message 
        });
    }
});

// Keep the original route for backward compatibility
router.post("/fooddonation", async (req, res) => {
    try {
        const { foodName, foodTag, quantity, expiryDate, address, email, location } = req.body.formData;

        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if user is a donor
        if (user.role !== 'donor') {
            return res.status(403).json({ message: "Only donors can donate food" });
        }

        // Create a new food donation with location data
        const food = new Food({
            foodName,
            foodTag,
            quantity: Number(quantity), // Ensure quantity is a number
            expiryDate,
            address,
            location: location || {
                type: "Point",
                coordinates: [0, 0] // Default coordinates if none provided
            },
            user: user._id, // Associate food with the user
        });

        // Save the food donation to the database
        await food.save();
        
        // Add the food to the user's food array and save
        user.food.push(food._id);
        await user.save();

        res.status(201).json({ 
            success: true, 
            message: "Food donation created successfully", 
            food 
        });
    } catch (error) {
        console.error("Food donation error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
});

// Route to get user's donations - update to use email
router.get("/mydonations", async (req, res) => {
    try {
        // Get email from query parameter
        const email = req.query.email;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        
        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Find all donations from this user
        const donations = await Food.find({ user: user._id })
            .sort({ createdAt: -1 }); // Sort by newest first
        
        res.status(200).json({
            success: true,
            donations
        });
    } catch (error) {
        console.error("Error fetching user donations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch donations",
            error: error.message
        });
    }
});

// Keep the old endpoint for backward compatibility
router.get("/mydonations/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find all donations from this user
        const donations = await Food.find({ user: userId })
            .sort({ createdAt: -1 }); // Sort by newest first
        
        res.status(200).json({
            success: true,
            donations
        });
    } catch (error) {
        console.error("Error fetching user donations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch donations",
            error: error.message
        });
    }
});

// Route to delete a donation
router.delete("/donations/:donationId", async (req, res) => {
    try {
        const { donationId } = req.params;
        
        // Check if donation exists
        const donation = await Food.findById(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }

        // Delete the donation
        await Food.findByIdAndDelete(donationId);
        
        res.status(200).json({
            success: true,
            message: "Donation deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting donation:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete donation",
            error: error.message
        });
    }
});

// Route to get all available food donations
router.get("/availabledonations", async (req, res) => {
    try {
        // Find all available donations, sorted by newest first
        const donations = await Food.find({ status: "available" })
            .sort({ createdAt: -1 })
            .populate('user', 'name email'); // Include donor details
        
        res.status(200).json({
            success: true,
            count: donations.length,
            donations
        });
    } catch (error) {
        console.error("Error fetching available donations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch available donations",
            error: error.message
        });
    }
});

// Route to get nearby food donations based on location
router.get("/nearbydonations", async (req, res) => {
    try {
        const { lat, lng, distance = 10 } = req.query; // distance in km, default 10km
        
        // If no coordinates provided, return all available donations
        if (!lat || !lng) {
            return res.redirect('/availabledonations');
        }

        // Find nearby donations using MongoDB's geospatial query
        const donations = await Food.find({
            status: "available",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseFloat(distance) * 1000 // Convert km to meters
                }
            }
        }).populate('user', 'name email');

        // Calculate distance for each donation
        const donationsWithDistance = donations.map(donation => {
            // Calculate distance in km
            const donationCoords = donation.location.coordinates;
            const distance = calculateDistance(
                parseFloat(lat), 
                parseFloat(lng), 
                donationCoords[1], // lat
                donationCoords[0]  // lng
            );
            return {
                ...donation._doc,
                distance: parseFloat(distance.toFixed(1))
            };
        });
        
        // Sort by distance
        donationsWithDistance.sort((a, b) => a.distance - b.distance);

        res.status(200).json({
            success: true,
            count: donationsWithDistance.length,
            donations: donationsWithDistance
        });
    } catch (error) {
        console.error("Error fetching nearby donations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch nearby donations",
            error: error.message
        });
    }
});

// Function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Route to update donation status
router.patch("/donations/:donationId/status", async (req, res) => {
    try {
        const { donationId } = req.params;
        const { status, reservedBy } = req.body;
        
        // Check if donation exists
        const donation = await Food.findById(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }

        // Update donation status
        const updatedDonation = await Food.findByIdAndUpdate(
            donationId,
            { 
                status,
                reservedBy: reservedBy || undefined,
                updatedAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Donation status updated to ${status}`,
            donation: updatedDonation
        });
    } catch (error) {
        console.error("Error updating donation status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update donation status",
            error: error.message
        });
    }
});

// Route to update donation details
router.put("/donations/:donationId", async (req, res) => {
    try {
        const { donationId } = req.params;
        const { name, quantity, date, address, tag } = req.body;
        
        // Check if donation exists
        const donation = await Food.findById(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }
        
        // Only allow editing if donation is still available
        if (donation.status !== "available") {
            return res.status(400).json({
                success: false,
                message: "Cannot edit donation that is already reserved or completed"
            });
        }

        // Update donation
        const updatedDonation = await Food.findByIdAndUpdate(
            donationId,
            { 
                foodName: name,
                quantity: Number(quantity),
                expiryDate: date,
                address,
                foodTag: tag,
                updatedAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Donation updated successfully",
            donation: updatedDonation
        });
    } catch (error) {
        console.error("Error updating donation:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update donation",
            error: error.message
        });
    }
});

// Route to get donation details
router.get("/donations/:donationId", async (req, res) => {
    try {
        const { donationId } = req.params;
        
        const donation = await Food.findById(donationId)
            .populate('user', 'name email')
            .populate('reservedBy', 'name email');
            
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }
        
        res.status(200).json({
            success: true,
            donation
        });
    } catch (error) {
        console.error("Error fetching donation details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch donation details",
            error: error.message
        });
    }
});

export default router;
