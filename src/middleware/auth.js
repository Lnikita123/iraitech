const jwt = require('jsonwebtoken')

const authentication = async function(req, res, next){
    try {
        const token = req.headers["x-api-key"]
        if (!token) {
        return res.status(400).send({ status: false, message: `Token Not Found` })}    
        
        let decodedToken = jwt.verify(token, "iraitechProject")
        
        if (!decodedToken) {
        return res.status(401).send({ status: false, message: `Invalid Token` })}
        req.userId = decodedToken.userId

        next()
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = {authentication}