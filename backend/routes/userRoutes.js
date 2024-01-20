import express from 'express'
import getUserProfile from '../controllers/user/getUserProfile.js'
import chechAuth from '../middleware/checkAuthMiddleware.js'
import updateUserProfile from '../controllers/user/updateUserProfile.js';
import deleteMyAccount from '../controllers/user/deleteMyAccount.js';
import role from "../middleware/roleMiddleware.js"
import getAllUserAccounts from '../controllers/user/getAllUserAccount.js';
import deleteUserAccount from '../controllers/user/deleteUserAccount.js';

const router = express.Router();

router
    .route("/profile")
    .get(chechAuth,getUserProfile)
    .patch(chechAuth, updateUserProfile)
    .delete(chechAuth, deleteMyAccount);

router.route("/all").get(chechAuth,role.checkRole(role.ROLES.Admin),getAllUserAccounts);

router.route("/:id").delete(chechAuth, role.checkRole(role.ROLES.Admin), deleteUserAccount)

export default router;

