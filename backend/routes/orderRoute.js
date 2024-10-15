
const express = require("express");
const { deleteOrder, getAllOrder, getSingleOrder, myOrder, newOrder, updateOrder } = require("../controllers/orderController");
const { isAuthentication ,authorizeRoles } = require("../middleware/auth");

const router=express.Router();



router.route("/order/new").post(isAuthentication, newOrder)

router.route("/order/:id").get(isAuthentication, getSingleOrder)

router.route("/orders/me").get(isAuthentication, myOrder);

router.route("/admin/orders").get(isAuthentication, authorizeRoles("admin"), getAllOrder);

router.route("/admin/order/:id").put(isAuthentication, authorizeRoles("admin"), updateOrder).delete(isAuthentication, authorizeRoles("admin"), deleteOrder);


module.exports = router;