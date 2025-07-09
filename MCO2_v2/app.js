/*const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');

const { User } = require('./database');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (disable default layout)
app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: false }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'view'));

// Connect to DB
mongoose.connect("mongodb://localhost:27017/LabDB")
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => console.error("DB connection failed:", err));

// Routes

app.get("/", (req, res) => {
  res.render("login", { layout: false }); // disable layout per-view
});

app.get("/register", (req, res) => {
  res.render("register", { layout: false });
});

app.post("/register", async (req, res) => {
  try {
    const data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    };

    const newUser = new User(data);
    await newUser.save();

    console.log("User registered:", newUser);
    res.redirect("/");
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Registration failed");
  }
});*/

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const exphbs=require('express-handlebars');
const db = require('./model/db.js');
const app = express();

app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: false }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'view'));
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res) => {
  res.render("login", { layout: false }); // disable layout per-view
});

app.get("/register", (req, res) => {
  res.render("register", { layout: false });
});

app.post("/register", async(req,res)=>{
    const data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    };

    await db.insertMany([data])

    res.render("dashboard")
})

app.post("/login", async(req,res)=>{
    try{
        const check=await db.findOne({email:req.body.email})

        if(check.password==req.body.password){
            
            res.render("dashboard")
        }else{
            res.send("wrong password")
        }

    }
    catch{
        req.send("wrong details")
    }
})

const port = 3000;
app.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}`)
});


