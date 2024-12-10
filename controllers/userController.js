import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// Model Import
import userModel from '../models/userModel.js';


export const SignupUser = async(req,res) => {
    try {
        const {fullName, email, password} = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const existsUser = await userModel.findOne({email});
        if (existsUser) {
            return res.status(409).json({error: "User already exists on this email!"});
        }   

        // Hased Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new userModel({
            fullName,
            email,
            password: hashedPassword,
        });
        await newUser.save();

        res.status(200).json({message: "User signup successfully.", newUser});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Error in signup user "+error.message});
    }
}

export const loginUser = async(req,res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const user = await userModel.findOne({email});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) return res.status(401).json({error: "Invalid email and password"});

            
        // Generate token
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
            expiresIn: '15d'
        });

        res.cookie("token", token, {
            httpOnly: true, //more secure
            maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
            sameSite: "strict" // CSRF
        });

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
        });
            

    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Error in login user "+error.message});
    }
}

export const loginAdmin = async(req,res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ error: "You are not authorized as an admin" });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) return res.status(401).json({error: "Invalid email and password"});
            
        // Generate token
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
            expiresIn: '15d'
        });

        res.cookie("token", token, {
            httpOnly: true, //more secure
            maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
            sameSite: "strict" // CSRF
        });

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
        });
            

    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Error in login user "+error.message});
    }
}

export const updateRole = async(req,res) => {
    try {
        const {role} = req.body;
        // const userId = req.user._id;
        const userId = req.params;
        
        if (!role) {
            return res.status(400).json({ error: "Role are required!" });
        }

        const user = await userModel.findById(userId);
        if(!user) return res.status(400).json({error: "User not found"});
        
        // Update Role
        user.role = role || user.role;
        await user.save();

        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Error in Updating role "+error.message});
    }
}