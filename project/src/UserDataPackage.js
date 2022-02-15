const fs = require("fs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const mess = "Account already exist";

//Function to create account
function AddUser(name, number, email, pass){
    const hashed = getHashedPassword(pass);
    let obj = {
        name : name,
        contact : number,
        email : email,
        password : hashed,
        otp : GenerateOTP()
    }
    let otp_val = obj.otp.toString();
    const path = `./public/UserData/${number}`;
    if(fs.existsSync(path)){
        return false;
    }
    else{
        fs.mkdirSync(path);
        fs.writeFileSync(`${path}/useraccount.txt`, JSON.stringify(obj));
        Mailing(email, otp_val);
        return true;
    }
}

//function to check login credentials
function AuthenticateUser(number,pass){
    const path = `./public/UserData/${number}`;
    if(fs.existsSync(path)){
        let filedata = fs.readFileSync(`${path}/useraccount.txt`,"utf-8");
        let objData = JSON.parse(filedata);
        return objData;
    }
    else{
        return false;
    }
}


//function to generate OTP
function GenerateOTP(){
    let x = Math.floor(Math.random()*9999);
    return x;
}


//function to send mail
function Mailing(mail, otp){
    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth : {
            user: "aaryansinghal2002@gmail.com",
            pass: "Lucifer@2002"
        }
    });

    let mailOptions = {
        from : "aaryansinghal2002@gmail.com",
        to: mail,
        subject: "OTP verification",
        text: otp,
    }

    transporter.sendMail(mailOptions, (error, info)=>{
        if(error){
            console.log("Error is = "+error);
        }
        else{
            console.log("Email sent ="+info.response);
        }
    })
}


//function to validate OTP
function MatchOTP(num,otp){
    const path = `./public/UserData/${num}/useraccount.txt`;
    let data = fs.readFileSync(path, "utf-8");
    let objData = JSON.parse(data);
    if(otp == objData.otp){
        return true;
    }
    else{
        return false;
    }
}


//function to get encrypted password
const getHashedPassword = (pass) => {
    const sha256 = crypto.createHash("sha256");
    const hash = sha256.update(pass).digest("base64");
    return hash;
}


//function to generate token to store cookie in browser
const getAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

module.exports = {
    AddUser,
    AuthenticateUser,
    GenerateOTP, 
    Mailing,
    MatchOTP,
    getHashedPassword,
    getAuthToken
}