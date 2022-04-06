const UrlModel = require("../models/UrlModel.js")
const validUrl = require('valid-url')
const shortid = require('shortid')   //npm install express mongoose shortid valid-url

const urlCreate = async function (req, res) {
    try {
        const data = req.body // destructure the longUrl from req.body.longUr
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please enter long url" })
        if (!(data.longUrl)) return res.status(400).send({ status: false, msg: "longUrl is required" })
        
        let url = await UrlModel.findOne({ longUrl: req.body.longUrl })
        if (url) {
            return res.status(200).send({ status: true, msg: url })
        }

        if (validUrl.isUri(data.longUrl)) {
            const urlCode = shortid.generate()
            const domain = req.protocol + '://' + req.get('host')
            data.shortUrl = domain + '/' + urlCode
            data.urlCode = urlCode
            // invoking the Url model and saving to the DB
            let url = await UrlModel.create(data)
            res.status(201).send({ status: true, msg: url })

        }
        else {
            res.status(401).json({ status: false, message: 'Invalid longUrl' })
        }
    }
    catch (err) {
        res.status(500).json({ status: false, message: err.message })
    }
}


const geturl = async function (req, res) {
    try {
        const url = await UrlModel.findOne({ urlCode: req.params.urlCode })
        if (url) {
            // when valid we perform a redirect
            return res.status(302).redirect(url.longUrl)
            //return res.send({ status: true, data: url.longUrl })
        } else {
            // else return a not found 404 status
            return res.status(404).json({ status: false, message: 'No URL Found' })
        }

    }
    catch (err) {
        res.status(500).json({ status: false, message: err.message })
    }
}


module.exports.urlCreate = urlCreate
module.exports.geturl = geturl