import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.js";

const router = Router();

// Signup route
router.post("/signup", async (req, res) => {
    try {
        // Extract all needed fields including role
        const { email, password, name, number, role } = req.body;
        
        // Log received data for debugging
        console.log("Received signup data:", { email, name, number, role });
        
        // Validate required fields
        if (!email || !password || !name || !number || !role) {
            return res.status(400).json({ 
                message: "All fields are required (email, password, name, number, role)" 
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        // Create new user with all required fields
        const user = new User({
            email,
            password: await bcrypt.hash(password, 10),
            name,
            number,
            role // Make sure we're including the role
        });
        
        // Save user to database
        await user.save();
        
        // Return success response
        res.status(201).json({ 
            message: "User created successfully",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
        
    } catch (error) {
        console.warn(error);
        res.status(500).json({ message: "Error signing up", error: error.message });
    }
});

// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Debugging
        console.log("Login attempt for:", email);

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found:", email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log("Incorrect password for:", email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send correct user information in response
        res.status(200).json({
            message: "Login successful",
            user: { 
                id: user._id, 
                name: user.name,  // Use name instead of username
                email: user.email, 
                role: user.role 
            },
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

export default router;
