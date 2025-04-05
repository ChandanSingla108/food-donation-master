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

export default router;
