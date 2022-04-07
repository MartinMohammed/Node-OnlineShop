// ------------ MANAGE AUTHENTICATION RELATED STUFF  -----------
const express = require("express");

const authController = require("./../controllers/MongoDB/auth");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);
module.exports = router;
