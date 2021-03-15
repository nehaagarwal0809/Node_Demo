const User = require("../models/users.model");
var validator = require("validator");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var response = require("../helpers/Response");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
const saltRounds = 10;
var ObjectId = require("mongoose").Types.ObjectId;

exports.signup = async (req, res) => {
  // const user = new User({
  //                 first_name: req.body.first_name,
  //                 last_name: req.body.last_name,
  //                 user_name: req.body.user_name,
  //                 email: req.body.email,
  //                 mobile: req.body.mobile,
  //                 state: req.body.state,
  //                 password: req.body.password,
  //               });

  //               try{
  //                   const a1 = await user.save();
  //                   res.json(a1);
  //               }catch(err){
  //                   res.send('Error')
  //               }
  let exists = await User.findOne({
    email: req.body.email,
  }).select("_id");
  if (exists) {
    response.send(
      req,
      res,
      400,
      "This email is already exist, please use another one!"
    );
  } else {
    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
      if (!err) {
        const user = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          user_name: req.body.user_name,
          email: req.body.email,
          mobile: req.body.phone,
          state: req.body.state,
          password: hash,
        });
        user
          .save()
          .then((data) => {
            let msg = "User added successfully";
            var resData = {
              success: true,
              data: data,
            };

            response.send(req, res, 200, msg, resData);
          })
          .catch((err) => {
            console.log("Error55555", err);
            response.send(
              req,
              res,
              400,
              "Something went wrong. Please try again later!"
            );
          });
      } else {
        response.send(
          req,
          res,
          400,
          "Something else went wrong. Please try again later!"
        );
      }
    });
  }
};

exports.login = (req, res) => {
  console.log("login req body ==> ", req.body);
  // Validate request
  if (
    _.isEmpty(req.body) ||
    validator.isEmpty(req.body.email) ||
    validator.isEmpty(req.body.password)
  ) {
    response.send(req, res, 400, "Email/Password can not be empty");
  }

  async function checkUser(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  User.findOne({ email: req.body.email.toLowerCase() }, function (err, admin) {
    if (err) {
      response.send(req, res, 403, "Some went wrong. Please try again later.");
    } else {
      if (_.isNull(admin)) {
        response.send(
          req,
          res,
          401,
          "You have entered an invalid email or password."
        );
      } else {
        const run = async () => {
          try {
            userValid = await checkUser(req.body.password, admin.password);
            if (userValid) {
              var token = jwt.sign(
                {
                  id: admin._id,
                  user_name: admin.user_name,
                  email: admin.email,
                },
                "supersecret",
                {
                  expiresIn: "11 days",
                }
              );

              var resData = {
                token: token,
                success: true,
                data: admin,
              };

              response.send(
                req,
                res,
                200,
                "You are successfully logged in.",
                resData
              );
              var updateFields = {
                token: token,
              };
              User.findOneAndUpdate(
                { _id: admin._id },
                updateFields,
                { new: true },
                function (err, result) {}
              );
            } else {
              response.send(
                req,
                res,
                400,
                "You have entered an invalid email or password."
              );
            }
          } catch (error) {
            console.log(error);

            response.send(req, res, 400, error);
          }
        };
        run();
      }
    }
  });
};

function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, "supersecret", (err, user) => {
    console.log(err);
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    //   req.user = user
    //   console.log(user)
    next(); // pass the execution off to whatever request the client intended
  });
}

exports.getUsers = (req, res) => {
  const token = req.headers.authorization;
  // const user_data = {};
  jwt.verify(token, "supersecret", (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    User.find(
      { _id: { $nin: [ObjectId(user.id)] } },
      async function (err, result) {
        console.log(result);
        if (err) {
          response.send(req, res, 400, err);
        } else {
          var resData = {
            success: true,
            data: result,
          };
          response.send(req, res, 200, "success", resData);
        }
      }
    );
  });
};
