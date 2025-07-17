var express=require("express");
var fileuploader=require("express-fileupload");
var mongoose=require("mongoose");
var cors=require("cors");
var path=require("path");
// var dotenv=require("dotenv");
require("dotenv").config();
const Application = require("./models/applicationModel");
var {url}=require ("./config/config");

var app=express();


app.use(cors());
app.use(express.json());
app.listen(2004,function(){
    console.log("Server Started...");
})

app.use(express.urlencoded({ extended: true }));
app.use(fileuploader());

// var url="mongodb+srv://adityabadaria1234:<db_password>@jan2025.qeg6a.mongodb.net/?retryWrites=true&w=majority&appName=jan2025";
var urll = url ;


// Connect to MongoDB

mongoose.connect(urll).then(()=>{
    console.log("Connected");
}).catch((err)=>{
    console.log(err.message);
})


// Define the Application model
// const applicationSchema = new mongoose.Schema({}, { strict: false });
// const Application = mongoose.model('Application', applicationSchema, 'applications');


// ✅ Fetch all applications
app.get("/applications", async (req, res) => {
    try {
        const applications = await Application.find(); // Fetch all documents
        res.json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
});

app.delete("/applications/:id", async (req, res) => {
    try {
        const deletedApp = await Application.findByIdAndDelete(req.params.id);
        if (!deletedApp) {
            return res.status(404).json({ status: false, msg: "Application not found" });
        }
        res.json({ status: true, msg: "Application deleted successfully!" });
    } catch (error) {
        console.error("Error deleting application:", error);
        res.status(500).json({ status: false, msg: "Failed to delete application" });
    }
});

var userRouter=require("./routers/userRouter");
app.use("/user",userRouter);

var adminRouter=require("./routers/adminRouter");
app.use("/admin",adminRouter)

const dailySalesRouter = require('./routers/dailySalesRouter');
app.use('/api/dailysales', dailySalesRouter);


// const authRoutes = require("./routes/auth");     
// app.use("/api/auth", authRoutes);