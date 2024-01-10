import express from 'express'
import getUserProfile from '../controllers/user/getUserProfile.js'
import chechAuth from '../middleware/checkAuthMiddleware.js'
import updateUserProfile from '../controllers/user/updateUserProfile.js';

const router = express.Router();

router.route("/profile").get(chechAuth,getUserProfile).patch(chechAuth, updateUserProfile);
export default router;

