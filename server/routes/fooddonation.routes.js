import { Router } from "express";

import Food from "../models/food.js";
import User from "../models/user.js";

const router = Router();

// Route to handle food donation form submission
router.post("/fooddonation", async (req, res) => {
    try {
        const { foodName, foodTag, quantity, expiryDate, address, email } = req.body.formData;

        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create a new food donation
        const food = new Food({
            foodName,
            foodTag,
            quantity: Number(quantity), // Ensure quantity is a number
            expiryDate,
            address,
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

export default router;
