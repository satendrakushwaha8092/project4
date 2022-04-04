const urlModel = require("../models/UrlModel.js")
var shortUrl = require("node-url-shortener");

const urlCreate = async function (req, res) {
try {
    let data = req.body;
    shortUrl.short("data.longUrl", async function (err, url) {
        data.shortUrl="http://localhost:3000/"+url
        data.urlCode=url
        let savedData =await urlModel.create(data)
        return res.status(201).send({ status: true, msg: savedData });
});
    }
catch (error) {
    console.log(error)
    return res.status(500).send({ status: false, msg: error.message })
}
}

const geturl = async function (req, res) { 
    try {
        let url=req.params.urlCode
        console.log(urlCode)
        let savedData = await urlModel.find({url})
        if(!savedData) res.status(400).send({ status: false, msg:"url is not present" })
        return res.status(201).send({ status: true, msg: savedData });
        }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
    }
module.exports.urlCreate=urlCreate
module.exports.geturl=geturl
