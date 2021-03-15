var express = require("express");
var router = express.Router();

const users = require("../src/controllers/users.controller");

/* GET users listing. */
router.get("/", function (req, res, next) {
  console.log("get request");
  res.send("respond with a resource");
});

router.post("/signup", users.signup);
router.post("/login", users.login);
router.get("/getUsers", users.getUsers);
router.get("/getUserProfile", users.getUserProfile);

module.exports = router;
