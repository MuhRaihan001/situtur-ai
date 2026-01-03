const {isLoggedIn, isUser} = require('../../middleware/auth');
const Tokenizer = require('../../handler/token');
const token = new Tokenizer();

exports.middleware = [isLoggedIn, isUser];

exports.GET = async function (req,res,next){
    const rawData = req.signedCookies.userData;
    const user = await token.verify(rawData);
    res.render('user/Monitor', {title: 'Situtur | Daftar Hadir', username: user.username});
}