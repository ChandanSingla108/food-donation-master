import { Router } from "express";
import Food from "../models/food.js";

const router = Router();

router.get("/allfoods", async (req, res) => {
    try {
        // Fetch food items with user details (for donor name)
        const allFood = await Food.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 }); // Sort by newest first
        
        res.status(200).json(allFood);
    } catch (error) {
        console.error("Error fetching foods:", error);
        res.status(500).json({ 
            success: false,
            message: "Server Error", 
            error: error.message 
        });
    }
});

// Add route to get food by ID
router.get("/food/:id", async (req, res) => {
    try {
        const food = await Food.findById(req.params.id)
            .populate('user', 'name email');
        
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }
        
        res.status(200).json(food);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Add route to get nearby food
router.get("/nearbyfoods", async (req, res) => {
    try {
        const { lat, lng, distance = 5 } = req.query; // distance in km, default 5km
        
        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        // Find food items within the specified distance
        const nearbyFood = await Food.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)] // MongoDB uses [longitude, latitude]
                    },
                    $maxDistance: parseFloat(distance) * 1000 // Convert km to meters
                }
            }
        }).populate('user', 'name email role');

        // Calculate and add distance to each food item
        const foodWithDistance = nearbyFood.map(food => {
            // Calculate distance in km
            const [foodLng, foodLat] = food.location.coordinates;
            const distance = calculateDistance(
                parseFloat(lat), parseFloat(lng),
                foodLat, foodLng
            );
            
            // Convert to JSON to add the distance property
            const foodObj = food.toObject();
            foodObj.distance = distance;
            
            return foodObj;
        });
        
        res.status(200).json(foodWithDistance);
    } catch (error) {
        console.error("Error fetching nearby foods:", error);
        res.status(500).json({ 
            success: false,
            message: "Server Error", 
            error: error.message 
        });
    }
});

// Helper function to calculate distance in km using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
}

export default router;
