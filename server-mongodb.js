var express=require("express");
var fileuploader=require("express-fileupload");
var mongoose=require("mongoose");
var cors=require("cors");
var path=require("path");

var app=express();

app.use(cors());
app.listen(2004,function(){
    console.log("Server Started...");
})
app.use(express.urlencoded({ extended: true }));
app.use(fileuploader());

// var url="mongodb://localhost:27017/jan2025";
// var url="mongodb+srv://Vanshjindal:vansh*1427@vansh2025.5nvs6.mongodb.net/?retryWrites=true&appName=Vansh2025";
var url="mongodb+srv://adityabadaria1234:cuAD2CjDYiVXs2ni@jan2025.qeg6a.mongodb.net/?retryWrites=true&appName=jan2025";

mongoose.connect(url).then(()=>{
    console.log("Connected");
}).catch((err)=>{
    console.log(err.message);
})

var userScheema=mongoose.Schema;

var userColSchema={
    uid:{type:String,required:true,index:true,unique:true},
    pwd:String,
    dos:{type:Date,default:Date.now},
    picpath:String
}
var ver={
    versionKey: false, // to avoid __v field in table come by default
  }
var UserColShema=new userScheema(userColSchema,ver);
var UserColRef=mongoose.model("userCollection",UserColShema);//create collection in mongodb database

app.get("/saveuser",(req,resp)=>{
        console.log(req.query);
        req.query.picpath="nopic.jpg";
        var userObj=new UserColRef(req.query);
        userObj.save().then((document)=>{
                resp.send(document)
        }).catch((err)=>{
                console.log(err.message);
                resp.send(err.message)

        })
})

app.post("/save1",(req,resp)=>{

    let filename="nopic.jpg";
    if(req.files!=null)
    {
        filename=req.files.ppic.name;

        var filepath=path.join(__dirname,"uploads",filename);
        req.files.ppic.mv(filepath);
        console.log(filepath)
    }
    else
    console.log(req.files);


    req.body.picpath=filename; //adding a n ew field in body object



    //==========================================
    var userJson=new UserColRef(req.body);

    userJson.save().then((doc)=>{
        resp.send(doc);  //saved doc will be returned
    }).catch((err)=>{
        resp.send(err.message);
    })
})
app.get("/show",(req,resp)=>{
    
   
    UserColRef.find().then((document)=>{
            resp.send(document)
    }).catch((err)=>{
            console.log(err.message);
            resp.send(err.message)

    })
})

app.get("/find", (req, resp) => {
    const query = req.query; 
    UserColRef.find(query)
        .then((document) => {
            resp.send(document); 
        })
        .catch((err) => {
            console.log(err.message);
            resp.send(err.message); 
        });
});

app.post("/update", (req, resp) => {
    const filter = { _id: req.body._id }; 
    const update = req.body;
    UserColRef.findOneAndUpdate(filter, update, { new: true }) 
            .then((updatedDocument) => {
            if (updatedDocument) {
                resp.send(updatedDocument); 
            } else {
                resp.status(404).send("User not found"); 
            }
        })
        .catch((err) => {
            console.log(err.message);
            resp.send(err.message); 
        });
});

