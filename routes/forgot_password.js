const sanitizeHtml = require('sanitize-html');

exports.get = function(req,res,next){
    res.render('forgot_password', {title: "Forgot Password"})
}

exports.post = async function(req, res, next){
    const db = req.app.locals.db;

    try{
        const email = sanitizeHtml(req.body.email);
        const sql = "select * from user where email = ?";
        const result = await db.query[sql, email];
        if (results.length === 0) {
            return res.status(401).send("Email Its Already");
        }
        
    }catch(err){

    }
}