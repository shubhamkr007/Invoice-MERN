import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../../models/useModel.js"

// $-title  Get New access token from the refresh token
// $-path   GET /api/v1/new_access_token
// $-auth   Public
// for rotation and refresh token.

const newAccessToken = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        res.sendStatus(401);
    }

    const refreshToken = cookies.jwt;

    const options = {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'None',
        secure: true
    }

    res.clearCookie("jwt", options);

    const existingUser = await User.findOne({ refreshToken }).exec();

    if (!existingUser) {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY, async (err, decoded) => {
            if (err) {
                res.sendStatus(403);
            }
            const hackedUser = await User.findOne({ _id: decoded.id }).exec();

            hackedUser.refreshToken = [];
            await hackedUser.save();
        })
        res.sendStatus(403);
    }

    const newRefreshTokenArray = existingUser.refreshToken.filter(refT => refT !== refreshToken);

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY, async (err, decoded) => {
        if (err) {
            existingUser.refreshToken = [...newRefreshTokenArray];
            await existingUser.save();
        }

        if (err || existingUser._id.toString() !== decoded.id) {
            return res.sendStatus(403);
        }
        const accessToken = jwt.sign({
            id: existingUser._id,
            roles: existingUser.roles,
        }, process.env.JWT_ACCESS_SECRET_KEY, { expiresIn: "1h" });

        const newRefreshToken = jwt.sign(
            { id: existingUser._id },
            process.env.JWT_REFRESH_SECRET_KEY,
            { expiresIn: "1d" }
        )

        existingUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await existingUser.save();

        const options = {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'None',
            secure: true
        }

        res.cookie("jwt", newRefreshToken, options);
        res.json({
            success: true,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            username: existingUser.username,
            provider: existingUser.provider,
            avatar: existingUser.avatar,
            accessToken
        });

    })
})

export default newAccessToken;