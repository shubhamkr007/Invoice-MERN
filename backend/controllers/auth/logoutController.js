import asyncHandler from 'express-async-handler'
import User from '../../models/useModel.js'



const logoutUser = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if(!cookies?.jwt){
        res.status(204)
        throw new Error('No Cookie found')
    }

    const refreshToken = cookies.jwt;

    const existingUser = await User.findOne({
        refreshToken
    })

    
    if (!existingUser) {
        res.clearCookie("jwt",{
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        res.sendStatus(204);
    }
    existingUser.refreshToken = existingUser.refreshToken.filter(
        (refT=> refT !== refreshToken)
    )

    await existingUser.save();

    res.clearCookie(
        "jwt",
        {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }
    )

    res.status(200)
    res.json({
        success : true,
        message : `${existingUser.firstName}, You have been Logged Out of successfully`
    })
})


export default logoutUser;