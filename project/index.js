const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const handlebar = require("hbs");
const exphbs = require("express-handlebars");
const  mydata = require("./src/UserDataPackage");
const PORT = 3000;
const app = express();

const STATIC_PATH = path.join(__dirname,"./public");
app.use(express.static(STATIC_PATH));

const PARTIAL_PATH = path.join(__dirname, "./views/partials");
handlebar.registerPartials(PARTIAL_PATH);

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const hbs = exphbs.create({
    extname: "hbs",
    layoutsDir: "./views/layouts",
    defaultLayout: "main"
})

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.get("/", (req,res)=>{
    var passedVariable = req.query.message;
    var passed2 = req.query.err;
    let demo = {
        msg: passedVariable,
        msg2: passed2
    }
    res.render("login", demo);
})

const authtokens = {};
app.post("/login", (req,res)=>{
    const {num, pass} = req.body;
    let val = mydata.AuthenticateUser(num, pass);
    if(val == false){
        let auth_err = "Account does not exist";
        res.redirect("/?err="+auth_err);
    }
    else{
        const hashed = mydata.getHashedPassword(pass);
        let user = (hashed == val.password);
        if(user){
            const token = mydata.getAuthToken();
            authtokens[token] = user;
            res.cookie("AuthToken", token);
            res.redirect("/welcome");
        }
        else{
            let auth_err = "Oops!! Wrong Password";
            res.redirect("/?err="+auth_err);
        }
    }
})


app.get("/register",(req,res)=>{
    var passedVariable = req.query.error;
    let demo = {
        msg : passedVariable
    }
    res.render("register", demo);
})

// app.get("/otp-check",(req,res)=>{
//     res.render("ValidateOTP");
// })

app.post("/otp-check",(req,res)=>{
    const {name, num, mail, pass} = req.body;
    let val = mydata.AddUser(name, num, mail, pass);
    if(val == false){
        let error_demo = "Account already exist";
        res.redirect("/register?error="+error_demo);
    }
    else if(val == true){
        let number = {
            num_val : num
        }
        res.render("ValidateOTP",number);
    }
})


app.post("/success", (req,res)=>{
    const {ctc, otp} = req.body;
    let a = mydata.MatchOTP(ctc, otp);
    if(a == true){
        let err = "Account successfully created";
        res.redirect("/?message="+err);
    }
    else{
        res.redirect("/otp-check");
    }
})


app.use((req,res,next) => {
    const authToken = req.cookies['AuthToken'];
    req.user = authtokens[authToken];
    next();
});

app.get("/welcome", (req,res)=>{
    if(req.user){
        res.render("welcome");
    }
    else{
        res.render("login");
    }
});

app.get("/logout", (req,res)=>{
    res.clearCookie("AuthToken");
    res.redirect("/welcome");
})

//for pages with wrong URL
app.get("*",(req,res)=>{
    res.render("errorpage");
})

app.listen(PORT, (req,res)=>{
    console.log(`Server Started at port: ${PORT}`);
})