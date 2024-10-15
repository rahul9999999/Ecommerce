
const express = require("express")
const {  createUser, forgotPassword, getAllUser, getUserDetails, login,logout,resetPassword, updatePassword, updateProfile,getSingleUser, updateUserRole, deleteUser
 } = require("../controllers/userController")
const {isAuthentication, authorizeRoles} = require("../middleware/auth")

const router = express.Router()


router.route("/register").post(createUser)

router.route("/login").post(login)

router.route("/password/forgot").post(forgotPassword)

router.route("/password/reset/:token").put(resetPassword)

router.route("/logout").get(logout);

router.route("/me").get(isAuthentication, getUserDetails);

router.route("/password/update").put(isAuthentication, updatePassword);

router.route("/me/update").put(isAuthentication, updateProfile);

router.route("/admin/users").get(isAuthentication, authorizeRoles("admin"),getAllUser);

router.route("/admin/user/:id")
    .get(isAuthentication, authorizeRoles("admin"),getSingleUser)
    .put(isAuthentication, authorizeRoles("admin"),updateUserRole)
    .delete(isAuthentication, authorizeRoles("admin"),deleteUser);

module.exports = router;