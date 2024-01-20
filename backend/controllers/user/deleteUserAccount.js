import asyncHandler from 'express-async-handler'
import User from '../../models/useModel.js'

// $-title  Delete user account
// $-path   DELETE /api/v1/user/:id
// $-auth   Private/Admin
//an admin can delete any user account
const deleteUserAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if(user){
        const userFirstName = user.firstName;
        await user.deleteOne();
        
        res.json({
            success: true,
            message: `User ${userFirstName} deleted`
        });
    }
    else{
        res.status(404)
        throw new Error("User not Found")
    }
})

export default deleteUserAccount;