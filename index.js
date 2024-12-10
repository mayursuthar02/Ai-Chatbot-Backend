// Packages
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Routes Import
import userRoute from './routes/userRoute.js';
import resourceRoute from './routes/resourceRoute.js';

// Database Import
import connectDB from './db/connectDB.js';


// Configutation
dotenv.config();
const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

// Database Connection
connectDB();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(cookieParser());


// Routes
app.use('/api/auth', userRoute);
app.use('/api/users', userRoute);
app.use('/api/resources', resourceRoute);


// Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
    console.log(`Server listen on port : ${PORT}`);
});