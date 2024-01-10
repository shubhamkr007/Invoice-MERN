import asyncHandler from 'express-async-handler'
import User from '../../models/useModel.js'

// $-title  Update user
// $-path   PATCH /api/v1/user/profile
// $-auth   Private

const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const {password,passwordConfirm, email, isEmailVerified, provider, roles, googleID, username } = req.body;

    const user = await User.findById(userId);

    if(!user){
        res.status(400);
        throw new Error('No user with this id')
    }

    if(password || passwordConfirm){
        res.status(400)
        throw new Error("This Route is not for password reset update. Please user the password reset Functionality");
    }

    if(email || isEmailVerified || provider || roles || googleID){
        res.status(400);
        throw new Error("You are not allowed to update your profile")
    }

    const fieldsToUpdate = req.body

    const updatedProfile = await User.findByIdAndUpdate(userId, {...fieldsToUpdate}, {new: true, runValidators:true}).select("-refreshToken");

    res.status(200).json({
        success: true,
        message: `${user.firstName}, Your profile was successfully updated`,
        updatedProfile,
    })
})

export default updateUserProfile;