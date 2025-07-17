var express=require("express");

var obj=require("../controllers/userController");
const { validateTokenn2 } = require("../config/validate");
const { updateStatusAndSendEmail } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware.js"); // Adjust path if needed

var userRouter=express.Router();

userRouter.get("/saveuser",obj.doSaveUserWithGet);
userRouter.get("/ShowAll",obj.doShowAll)
userRouter.post("/saveuserWithPost",obj.doSaveUserWithPost);
userRouter.post("/saveuserWithPic",obj.doSaveUserWithPic);
userRouter.get("/validatetokenn",obj.validateTokenn);
userRouter.post("/doDelete",validateTokenn2,obj.doDelete);
userRouter.post("/doSubmit",obj.doSubmit);
userRouter.post("/login", obj.doLogin);
userRouter.post("/changePassword", protect, obj.changePassword);

// userRouter.post("/updateStatus", async (req, res) => {
//     const { id, status, email, phone } = req.body;
//     console.log("router"+id);
//     const result = await updateStatusAndSendEmail(id, status, email, phone);
//     res.json(result);
// });
userRouter.post("/updateStatus", async (req, res) => {
    console.log("Received Headers:", req.headers);
    console.log("Received Data:", req.body); // Debugging

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Empty request body! Ensure JSON parsing is enabled." });
    }

    const { id, status, email, phone } = req.body;
    console.log("Router ID:", id);

    const result = await updateStatusAndSendEmail(id, status, email, phone);
    res.json(result);
});




module.exports=userRouter;