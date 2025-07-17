var jwt =require("jsonwebtoken");
function validateTokenn2(req,resp,next)
{
    console.log("@@@@");
    const full_token = req.headers['authorization'];
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
            next();
            //resp.json({status:true,msg:"**Aauthorized",item:payload});
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

module.exports={validateTokenn2}