
const express = require("express");
const { createProduct, createProductReview, deleteProduct, deleteReview, getAllProducts, getProductDetails, getProductReviews, updateProduct, getAllAdminProducts  } = require("../controllers/productController");
const { isAuthentication,authorizeRoles } = require("../middleware/auth");

const router = express.Router()




router.route("/products").get(getAllProducts);
router.route("/admin/products").get(isAuthentication,authorizeRoles("admin"),getAllAdminProducts)

router.route("/admin/product/new").post(isAuthentication, authorizeRoles("admin"),createProduct);

router.route("/admin/product/:id").put(isAuthentication, authorizeRoles("admin"), updateProduct).delete(isAuthentication, authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthentication, createProductReview)

router .route("/reviews").get(getProductReviews).delete(isAuthentication, deleteReview)

module.exports = router