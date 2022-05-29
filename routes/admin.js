var express = require("express");
var router = express.Router();

const cors = require("cors");
const getUsersFromDatabase = require("../models/getUsersFromDatabase");

////// Admin login page //////

// Html for login page
let loginForm = `
<h1>Logga in:</h1>
<form action="/admin" method="post">
<label for="password">Lösenord: </label>
<input type="text" name="password" id="password">
<button id="loginBtn">Logga in</button>
</form>
`;

// Prints HTML
router.get("/", function (req, res) {
    res.send(loginForm);
});

//Controls if the password provided = "admin" (static password ). If yes, user is logged in, else an error message is provided
router.post("/", function (req, res) {
    let adminPassword = "admin";

    if (req.body.password == adminPassword) {
        res.cookie("userId", "adminCookie", {
            signed: true,
        });

        res.redirect("/admin/showusers");
    } else res.send(loginForm + "<p>Fel lösenord, var god försök igen.</p>");
});

//Check if user is authorized so routes can only be accessed when admin is loggedin
function checkIfAuthorized(req, res) {
    if (!req.signedCookies["userId"]) {
        res.status(401).send("Du är inte behörig");
    }
}

////// Show users page //////
router.get("/showusers", function (req, res) {
    checkIfAuthorized(req, res);

    //Prints all registered users
    let allUsers =
        "<h1>Alla registrerade användare</h1> <a href='/admin/subscribers'>Se e-postadresser till de som prenumererar</a>";

    const test = getUsersFromDatabase
        .getUsersFromDatabase(req, "users")
        .then((result) => {
            let userListFromDatabase = result;

            userListFromDatabase.forEach((user) => {
                allUsers += `
        <div className="userDiv">
        <p>Användarnamn: ${user.username}</p>
        <p>E-post: ${user.email}</p>
        <p>Prenumererar: ${user.wantsNewsLetter ? "Ja" : "Nej"}</p>
        </div>`;
            });

            res.send(allUsers + "<a href='/admin/logout'>Logga ut</a>");
        });
});

////// Show subscribers page //////

// Prints all emails for users that subscribe
router.get("/subscribers", function (req, res) {
    checkIfAuthorized(req, res);

    let allSubscribers = "<h1>Prenumeranter</h1>";

    const getSubscribers = getUsersFromDatabase
        .getUsersFromDatabase(req, "users")
        .then((result) => {
            let usersEmails = result;

            usersEmails.forEach((user) => {
                if (user.wantsNewsLetter == true) {
                    allSubscribers += `
                <p>${user.email}</p>
                `;
                }
            });
            res.send(allSubscribers + "<a href='/admin/showusers'>Tillbaka</a>");
        });
});

//Clears cookies on logout so no one can access /showUsers routern without entering the password again
router.get("/logout", function (req, res) {
    res.clearCookie("userId");
    res.redirect("/admin");
});

module.exports = router;