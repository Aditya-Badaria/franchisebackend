var {getUserModel}=require("../models/userModel");
// import { toast } from "react-toastify";
const bcrypt = require('bcrypt');
// var UserColRef=getUserModel();
var path=require("path");
var jwt=require("jsonwebtoken");
const { sendEmail } = require("./nodemailer");
// const Application = require("../models/applicationModel"); // Ensure this model is defined
const Application = require("../models/applicationModel");
const IdPwdModel = require("../models/idPwdModel"); 
// const { nanoid } = require("nanoid/async");

function doSaveUserWithGet(req,resp)
{
        console.log(req.query);
        req.query.picpath="nopic.jpg";
        var userObj=new UserColRef(req.query);
        userObj.save().then((document)=>{
                //resp.send(document)
                resp.json({doc:document,status:true,msg:"Saved Successfully"});

        }).catch((err)=>{
                console.log(err.message);
                // resp.send(err.message);
                resp.json({status:false,msg:err.message});


        })
}
function doSaveUserWithPost(req,resp)
{
        console.log(req.body);
        req.body.picpath=req.body.ppic;

        var userObj=new UserColRef(req.body);
        userObj.save().then((document)=>{
                //resp.send(document)
                resp.json({doc:document,status:true,msg:"Saved Successfully with post"});

        }).catch((err)=>{
                console.log(err.message);
                //resp.send(err.message)
                resp.json({status:false,msg:err.message});

        })
}


function doSaveUserWithPic(req,resp)
{

    let filename="nopic.jpg";
    if(req.files!=null)
    {
        filename=req.files.ppic.name;

        var filepath=path.join(__dirname,"..","uploads",filename);
        req.files.ppic.mv(filepath);
        console.log(filepath)
    }
    else
    console.log(req.files);


    req.body.picpath=filename; //adding a n ew field in body object



    //==========================================
    var userJson=new UserColRef(req.body);

    userJson.save().then((document)=>{

        let jtoken=jwt.sign({uid:req.body.uid},process.env.SEC_KEY,{expiresIn:"1m"});

        resp.json({doc:document,status:true,msg:"Saved Successfully with pic",token:jtoken});
    }).catch((err)=>{
        resp.json({status:false,msg:err.message});
    })
}


function doShowAll(req,resp)
{
    UserColRef.find().then((document)=>{
            resp.send(document)
    }).catch((err)=>{
            console.log(err.message);
            resp.send(err.message)

    })
}

function validateTokenn(req,resp)
{
        console.log("******");
        const full_token=req.headers['authorization'];
        console.log(full_token);
        var ary=full_token.split(" ");
        let actualToken=ary[1];
        let isTokenValid;

        try{
                isTokenValid= jwt.verify(actualToken,process.env.SEC_KEY);
                console.log(isTokenValid);
                if(isTokenValid!=null)
                {
                    const payload = jwt.decode(ary[1]);
                    console.log(payload);
    
                    resp.json({status:true,msg:"**Aauthorized",item:payload});
                }
                else
                resp.json({status:false,msg:"**SORRRRYYY"});
                
                
            }
            catch(err)
            {
                resp.json({status:false,msg:err.message});
                return;
            }

}

function doDelete(req,resp)
{
        UserColRef.deleteOne({uid:req.body.uid}).then((msg)=>{
                if(msg.deletedCount==1)
                        resp.json({status: true, message: "Deleted" })

                else 
                        resp.json({status: true, message: "Invalid id"})
        }).catch((err) => {
                resp.send(err.message);
        })
}
function doSubmit(req, resp) {
        console.log("Request Body: ", req.body);
        var userObj = new UserColRef(req.body);
        userObj.save()
            .then((document) => {
                console.log("Saved Document: ", document);
                resp.json({ doc: document, status: true, msg: "Saved Successfully" });
            })
            .catch((err) => {
                console.error("Error: ", err.message);
                resp.json({ status: false, msg: err.message });
            });
    }
    
    ////////////////////////////////////////////////////////////////////////////////////


    async function updateStatusAndSendEmail(id, status, email, phone) {
        try {
            console.log("Updating application with ID:", id);
            const { nanoid } = await import("nanoid");
            const updatedApp = await Application.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );
    
            if (!updatedApp) {
                return { status: false, msg: "Application not found" };
            }
    

            // Extract part of the email before '@'
        const emailPrefix = updatedApp.youremail.split("@")[0]; // e.g., "john.doe" from "john.doe@example.com"
        
        // Generate a random 5-character ID using nanoid
        const uniquePart = nanoid(5); // Generates a 5-character random string

        // Combine email prefix + nanoid for unique User ID
        const userId = `${emailPrefix}_${uniquePart}`;
            // Generate a random password using nanoid
            const password = nanoid(10); // Generates a 10-character random password
            
            // Save userId and password to MongoDB in "idpwd_collection"
            const newUserCreds = new IdPwdModel({ userId, password });
            await newUserCreds.save();

            // Send email based on status
            let subject, text;
            switch (status) {
                case 1:
                    subject = "Application Accepted";
                    text = `Your application has been accepted.\n\nLogin Details:\nUser ID: ${userId}\nPassword: ${password}\n\nContact the authorized person at ${phone} or email ${email} for further details.`;
                    break;
                case -1:
                    subject = "Application Rejected";
                    text = `Your application has been rejected. Contact the authorized person at ${phone} or email ${email} for further details.`;
                    break;
                case 2:
                    subject = "Franchise Request Accepted";
                    text = `Your franchise request has been accepted.\n\nLogin Details:\nUser ID: ${email}\nPassword: ${password}\n\nContact the authorized person at ${phone} or email ${email} for further details.`;
                    break;
                default:
                    return { status: false, msg: "Invalid status" };
            }
    
            sendEmail(updatedApp.youremail, subject, text);
    
            return { 
                status: true, 
                msg: `Status updated to ${status} and email sent`, 
                userId: updatedApp.youremail, 
                password: password // You can return it for verification if needed
            };
        } catch (err) {
            console.error(err.message);
            return { status: false, msg: err.message };
        }
    }


    async function doLogin(req, resp) {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            return resp.status(400).json({ status: false, msg: "User ID and password are required" });
        }

        const user = await IdPwdModel.findOne({ userId });

        if (!user) {
            return resp.status(401).json({ status: false, msg: "Invalid User ID" });
        }

        if (user.password !== password) {
            return resp.status(401).json({ status: false, msg: "Invalid password" });
        }

        // Generate JWT Token
        let token = jwt.sign({ 
            uid: user._id,
            role: user.role,
            name: user.name || userId // Include name if available
        }, process.env.SEC_KEY, { expiresIn: "1h" });

        resp.json({
            status: true,
            msg: "Login Successful",
            token,
            user: {  // Return complete user object
                _id: user._id,           // ✅ added here
                userId: user.userId,
                role: user.role,
                name: user.name || userId,
                // Add any other relevant user fields
            }
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        resp.status(500).json({ status: false, msg: "Server Error" });
    }
}


const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // retrieved from protect middleware decoded token

  try {
    const user = await IdPwdModel.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // ⚠️ Plain text comparison for now (NOT secure in production)
    if (user.password !== oldPassword) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    // ✅ Directly set new password (plain text) for testing
    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password updated successfully" });

    // ✅ 🔒 FUTURE SECURITY (enable when you integrate bcrypt hashing):
    /*
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    */

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};


    module.exports={doSaveUserWithGet,doSaveUserWithPic,doLogin,doShowAll,doSaveUserWithPost,validateTokenn,doDelete,doSubmit,updateStatusAndSendEmail,changePassword}
