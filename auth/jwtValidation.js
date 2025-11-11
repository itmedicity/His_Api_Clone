const jwt = require("jsonwebtoken");
module.exports = {
    checkToken: (req, res, next) => {
        let token = req.get("authorization");
        if (token.startsWith("Bearer")) {
            // Remove Bearer from string
            token = token.slice(7);
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
        } else if ((token.startsWith("Token"))) {
            token = token.slice(6);
            jwt.verify(token, process.env.SECRET_KEY_MEL, (err, decoded) => {
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
        }
        else {
            return res.json({
                success: 101,
                message: "Invalid Token"
            });
        }
    }
};
