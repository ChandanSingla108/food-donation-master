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
        // First, perform cleanup of completed donations older than 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        
        // Find all completed donations older than 1 hour
        await Food.updateMany(
            { status: "completed", completedAt: { $lt: oneHourAgo } },
            { $set: { status: "archived" } }
        );
        
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
router.get("/nearbyfoods", async (req, res) => {
    try {
        const { lat, lng, distance = 10 } = req.query; // distance in km, default 10km
        
        // First, perform cleanup of completed donations older than 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        
        // Find all completed donations older than 1 hour
        await Food.updateMany(
            { status: "completed", completedAt: { $lt: oneHourAgo } },
            { $set: { status: "archived" } }
        );
        
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

// Route to request food (for recipients)
router.post("/requestFood/:donationId", async (req, res) => {
    try {
        const { donationId } = req.params;
        const { email, message } = req.body;
        
        // Find the donation
        const donation = await Food.findById(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }
        
        // Check if donation is available
        if (donation.status !== "available") {
            return res.status(400).json({
                success: false,
                message: "This food donation is no longer available"
            });
        }
        
        // Find the requesting user
        const requester = await User.findOne({ email });
        if (!requester) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Create a request
        const request = {
            requesterId: requester._id,
            requesterName: requester.name,
            requesterEmail: email,
            message: message || "I would like to request this food donation",
            status: "pending", // pending, accepted, rejected
            requestDate: new Date()
        };
        
        // Add the request to the donation's requests array
        if (!donation.requests) {
            donation.requests = [];
        }
        
        // Check if user already requested this donation
        const existingRequest = donation.requests.find(
            req => req.requesterEmail === email
        );
        
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You have already requested this donation"
            });
        }
        
        donation.requests.push(request);
        await donation.save();
        
        res.status(200).json({
            success: true,
            message: "Food request submitted successfully",
            request
        });
    } catch (error) {
        console.error("Error requesting food:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit food request",
            error: error.message
        });
    }
});

// Route to get all requests for a donor
router.get("/myRequests", async (req, res) => {
    try {
        const email = req.query.email;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        
        // Find the user (donor)
        const donor = await User.findOne({ email });
        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Find all donations from this donor that have requests
        const donations = await Food.find({ 
            user: donor._id,
            requests: { $exists: true, $not: { $size: 0 } }
        }).sort({ createdAt: -1 });
        
        // Format the response
        const requestsData = donations.map(donation => ({
            donationId: donation._id,
            foodName: donation.foodName,
            foodTag: donation.foodTag,
            quantity: donation.quantity,
            address: donation.address,
            expiryDate: donation.expiryDate,
            status: donation.status,
            requests: donation.requests
        }));
        
        res.status(200).json({
            success: true,
            count: requestsData.length,
            requests: requestsData
        });
    } catch (error) {
        console.error("Error fetching donor requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch donation requests",
            error: error.message
        });
    }
});

// Route to get all food requests made by a recipient
router.get("/myFoodRequests", async (req, res) => {
    try {
        const email = req.query.email;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        
        // Find all donations that contain a request from this user
        const donations = await Food.find({
            "requests.requesterEmail": email
        }).populate('user', 'name email');
        
        // Format the response data
        const requests = donations.map(donation => {
            const request = donation.requests.find(req => req.requesterEmail === email);
            return {
                donationId: donation._id,
                foodName: donation.foodName,
                foodTag: donation.foodTag,
                quantity: donation.quantity,
                expiryDate: donation.expiryDate,
                address: donation.address,
                donorName: donation.user.name,
                donorEmail: donation.user.email,
                status: donation.status,
                requestStatus: request.status,
                requestDate: request.requestDate,
                message: request.message
            };
        });
        
        res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("Error fetching user's food requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch your food requests",
            error: error.message
        });
    }
});

// Route to update request status (for donors)
router.patch("/updateRequest/:donationId", async (req, res) => {
    try {
        const { donationId } = req.params;
        const { requestId, action, email } = req.body; // action: accept, reject, complete
        
        // Find the donation
        const donation = await Food.findById(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }
        
        // Find the donor
        const donor = await User.findOne({ email });
        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Verify the donor owns this donation
        if (donation.user.toString() !== donor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to update this donation"
            });
        }
        
        // Find the request in the donation's requests array
        const requestIndex = donation.requests.findIndex(
            req => req._id.toString() === requestId
        );
        
        if (requestIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }
        
        // Update request status based on action
        if (action === "accept") {
            // Accept this request
            donation.requests[requestIndex].status = "accepted";
            
            // Mark all other requests as rejected
            donation.requests.forEach((req, idx) => {
                if (idx !== requestIndex) {
                    req.status = "rejected";
                }
            });
            
            // Update donation status to reserved
            donation.status = "reserved";
            donation.reservedBy = donation.requests[requestIndex].requesterId;
        } else if (action === "reject") {
            // Reject this request
            donation.requests[requestIndex].status = "rejected";
        } else if (action === "complete") {
            // Mark the donation as completed
            donation.status = "completed";
            
            // Set completion timestamp for cleanup
            donation.completedAt = new Date();
            
            // Get the accepted request
            const acceptedRequest = donation.requests.find(req => req.status === "accepted");
            if (acceptedRequest) {
                acceptedRequest.status = "completed";
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Use 'accept', 'reject', or 'complete'"
            });
        }
        
        await donation.save();
        
        res.status(200).json({
            success: true,
            message: `Request ${action}ed successfully`,
            donation
        });
    } catch (error) {
        console.error("Error updating request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update request",
            error: error.message
        });
    }
});

// Add a new route to fetch all food donations, including cleanup of completed ones
router.get("/fooddonations", async (req, res) => {
    try {
        // First, perform cleanup of completed donations older than 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        
        // Find all completed donations older than 1 hour
        const oldCompletedDonations = await Food.find({
            status: "completed",
            completedAt: { $lt: oneHourAgo }
        });
        
        // Log the cleanup for monitoring
        if (oldCompletedDonations.length > 0) {
            console.log(`Cleaning up ${oldCompletedDonations.length} completed donations older than 1 hour`);
            
            // Set these to "archived" status
            await Food.updateMany(
                { status: "completed", completedAt: { $lt: oneHourAgo } },
                { $set: { status: "archived" } }
            );
        }
        
        // Now fetch all non-archived donations
        const donations = await Food.find({ status: { $ne: "archived" } })
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        
        res.status(200).json({
            success: true,
            count: donations.length,
            donations
        });
    } catch (error) {
        console.error("Error fetching donations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch donations",
            error: error.message
        });
    }
});

// Add a new route to handle cleanup manually if needed
router.post("/cleanup", async (req, res) => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        
        // Find all completed donations older than 1 hour
        const result = await Food.updateMany(
            { status: "completed", completedAt: { $lt: oneHourAgo } },
            { $set: { status: "archived" } }
        );
        
        res.status(200).json({
            success: true,
            message: `Cleaned up ${result.modifiedCount} completed donations`,
            result
        });
    } catch (error) {
        console.error("Error performing cleanup:", error);
        res.status(500).json({
            success: false,
            message: "Failed to perform cleanup",
            error: error.message
        });
    }
});

export default router;
