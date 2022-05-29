var express = require("express");
var router = express.Router();

const cors = require("cors");
const CryptoJS = require("crypto-js");
var rand = require("random-key");

router.use(cors());

////Log in user////

router.post("/login", cors(), function (req, res) {
  let user = {
    username: req.body.username,
  };

  req.app.locals.db
    .collection("users")
    .find(user)
    .toArray()
    .then((result) => {
      //If the user provides wrong login details, the user object won't be found and status 400 is returned to client

      if (result[0] !== undefined) {
        //If user exists in database, the password is compared with the database password
        let decryptedPassword = CryptoJS.AES.decrypt(
          result[0].password,
          process.env.SALT_KEY
        ).toString(CryptoJS.enc.Utf8);

        if (decryptedPassword == req.body.password) {
          //Responds with userId (used to identify loggedin user client side)
          res.status(200).json({
            message: result[0].userId,
          });
          return;
        }
      } else {
        res
          .status(400)
          .json("Användarnamn och lösen stämmer ej, var god och pröva igen.");
      }
    });
});

////// Provide user data //////
router.post("/loggedin", cors(), function (req, res) {
  //When user is loggedin, based on the user ID, data about the user is sent to the browser

  let userId = {
    userId: req.body.userId,
  };

  req.app.locals.db
    .collection("users")
    .find(userId)
    .toArray()
    .then((result) => {
      res.send(result);
    });
});

////// Update user //////
router.put("/updateSubscription", function (req, res) {
  //Updates users subscription status based on userId

  req.app.locals.db
    .collection("users")
    .updateOne({
      userId: req.body.userId,
    }, {
      $set: {
        wantsNewsLetter: req.body.wantsNewsLetter,
      },
    })
    .then((result) => {});

  res.send("Successfully updated!");
});

//// Create new user ////

router.post("/newAccount", async function (req, res) {
  //Controls so the username doesn't already exist
  let isUserRegistered = await req.app.locals.db
    .collection("users")
    .find({
      username: req.body.username,
    })
    .toArray()
    .then((result) => {
      return result;
    });

  //If username is free, the user account will be created and if not an error message will be returned
  if (isUserRegistered == false) {
    let encryptedPassword = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SALT_KEY
    ).toString();

    //Saves user to mongoDB
    req.app.locals.db
      .collection("users")
      .insertOne({
        username: req.body.username,
        password: encryptedPassword,
        email: req.body.email,
        userId: rand.generate(),
        wantsNewsLetter: req.body.wantsNewsLetter,
      })
      .then((result) => {});

    res.json("New user created");
    return;
  } else {
    res.json("Username is taken, please try another name");
  }
});

module.exports = router;