import { ADMIN, USER } from '../constants/index.js'

const ROLES = {
    User: USER,
    Admin: ADMIN
};

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.user && !req?.roles) {
            res.status(401);
            throw new Error('Not authorized, user not logged in');
        }
        // console.log(req.user);

        const rolesArray = [...allowedRoles]
        // console.log(rolesArray, req.role);
        const roleFound = req.user.roles
            .map((role) => rolesArray.includes(role))
            .find((value) => value === true);


        if (!roleFound) {
            res.status(401);
            throw new Error("You are not authorized to perform this request");
        }
        next();
    }
}


const role = { ROLES, checkRole }

export default role;