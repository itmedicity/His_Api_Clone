const jwt = require("jsonwebtoken");
module.exports = {
    checkToken: (req, res, next) => {
        let token = req.get("authorization");
        console.log(token)
        if (token) {
            // Remove Bearer from string
            token = token.slice(7);
            console.log(token)
            jwt.verify(token, "@dhj$&$(*)dndkm76$%#jdn(^$6GH%^#73*#*", (err, decoded) => {
                if (err) {
                    console.log(err)
                    return res.json({
                        status: 102,
                        message: "Invalid Token"
                    });
                } else {
                    req.decoded = decoded;
                    // return res.json({
                    //   status: 100,
                    //   message: "valid token"
                    // });
                    next();
                }
            });
        } else {
            return res.json({
                success: 101,
                message: "Invalid Token"
            });
        }
    }
};
