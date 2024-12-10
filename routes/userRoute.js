import express from 'express';
import { loginAdmin, loginUser, SignupUser, updateRole } from '../controllers/userController.js';
import protectRoute from '../middleware/protectRoute.js';



const router = express.Router();


router.post("/signup", SignupUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.post("/update-role/:id", protectRoute, updateRole);



export default router;