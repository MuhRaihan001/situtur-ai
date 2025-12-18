const { SignJWT, jwtVerify } = require('jose');
const secret = new TextEncoder().encode(process.env.SECRET_KEY || 'situturai',);


class Tokenizer {

    async generate(payload = {}) {
        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(secret)
        return token;
    }

    async verify(token) {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    }
}

module.exports = Tokenizer;