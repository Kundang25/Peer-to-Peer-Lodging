
if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local"); 
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
app.locals.maptilerKey = process.env.MAPTILER_API_KEY;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}
// Handle mongoose connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.static("assets"));


let store;

async function createSessionStore() {
  try {
    // Use the same connection that was successful
    const connectionUrl = mongoose.connection.readyState === 1 ? 
      (dbUrl && mongoose.connection.host.includes('mongodb.net') ? dbUrl : MONGO_URL) : 
      MONGO_URL;
    
    store = MongoStore.create({
      mongoUrl: connectionUrl,
      crypto: {
        secret: process.env.SESSION_SECRET 
      },
      touchAfter: 24 * 60 * 60,
    });
    
    store.on("error", (err) => {
      console.error("❌ ERROR in MONGO SESSION STORE:", err.message);
    });
    
    console.log("✅ Session store created successfully");
    return store;
  } catch (error) {
    console.error("❌ Failed to create session store:", error.message);
    // Return memory store as fallback
    console.log("🔄 Using memory store as fallback (sessions won't persist)");
    return null;
  }
}

const sessionOptions = {
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};


app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  // console.log(res.locals.success); 
  next();
})



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


// // Catch-all for undefined routes
app.all(/^\/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err,req,res,next) => {
  let {statusCode=500,message="Something went wrong"} = err;
  res.status(statusCode).render("listings/error.ejs",{message,err});
})

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

// // app.get("/demouser",async(req,res)=>{
// //   let fakeUser = new User({
// //     email:"student@gmail.com",
// //     username:"delta-student"
// //   })
// //   let registeredUser = await User.register(fakeUser,"helloworld");
// //   res.send(registeredUser);
// // })

// // app.get("/", (req, res) => {
// //   res.send("Hi, I am root");
  
// // });
