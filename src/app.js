const express = require("express");
require("./db/userDB");
const User = require("./models/userSchema");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const app = express();
const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../src/templates/views");
const partials_path = path.join(__dirname, "../src/templates/partials");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", views_path);
hbs.registerPartials(partials_path);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

//* auth is a middleware
app.get("/member", auth, (req, res) => {
  res.render("index");
});

app.get("/registration", (req, res) => {
  res.render("registration");
});
app.post("/registration", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    if (password === cpassword) {
      const Users = new User({
        firstname: req.body.fname,
        lastname: req.body.lname,
        email: req.body.email,
        phone: req.body.phone,
        password: password,
        confirm_password: cpassword,
      });

      //*creating token for register
      const token = await Users.generateToken();
      

      //*creating cookie
      res.cookie("jwt", token,{expires:new Date(Date.now() + 30000) , httpOnly:true});

      const registeredUser = await Users.save();
      res.status(201).render("index", { name: req.body.fname });
      console.log(registeredUser);
    } else {
      res.send("password is incorrect");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const useremail = req.body.email;
    const password = req.body.password;
    const id = await User.findOne({ email: useremail });


    //* comparing password
    const confirmPassword = await bcrypt.compare(password, id.password);

    //*creating token for login (middleware)
    const token = await id.generateToken();

   //*creating cookie
   res.cookie("jwt", token,{expires:new Date(Date.now() + 300000) , httpOnly:true});

    if (confirmPassword) {
      res.status(201).render("index",{ name: req.body.fname });
    } else {
      res.send("Invalid email or password");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/logout", auth, async (req, res) => {
  try {
    //* logout from one device
    // req.user.tokens = req.user.tokens.filter((elem) => {
    //   return elem.token !== req.token;
    // });

    //*logout from all device
    req.user.tokes = [];
    res.clearCookie("jwt");
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error)    
  }
})

app.listen(port, () => {
  console.log(`server running on ${port} port`);
});
