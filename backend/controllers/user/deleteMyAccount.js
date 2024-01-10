import asyncHandler from 'express-async-handler'
import User from '../../models/useModel.js'

// $-title  Delete user account
// $-path   DELETE /api/v1/user/profile
// $-auth   Private

const deleteMyAccount = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    await User.findByIdAndDelete(userId);

    res.json({
        success: true,
        message: "Your User account has been Deleted"
    })
})

export default deleteMyAccount;