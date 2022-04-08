const UrlModel = require("./UrlModel.js")
const validUrl = require('valid-url')
const shortid = require('shortid')   //npm install express mongoose shortid valid-url
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  16368,
  "redis-16368.c15.us-east-1-2.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("Y52LH5DG1XbiVCkNC2G65MvOFswvQCRQ", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const urlCreate = async function (req, res) {  //
  try {
    const data = req.body // destructure the longUrl from req.body.longUr
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please enter long url" })
    if (!(data.longUrl)) return res.status(400).send({ status: false, msg: "longUrl is required" })
    if (await GET_ASYNC(`${data.longUrl}`)) {
      let data = JSON.parse(await GET_ASYNC(`${req.body.longUrl}`))
      return res.status(302).send({ status: true, msg:{longUrl: data.longUrl, shortUrl: data.shortUrl, urlCode:data.urlCode }, redis: "found in radius" })
    }
    let url = await UrlModel.findOne({ longUrl: req.body.longUrl }).select({ longurl: 1, shortUrl: 1, urlCode: 1 })
    if (url) {
      return res.status(200).send({ status: true, msg: url, url: "found in db" })
    }

    if (validUrl.isUri(data.longUrl)) {
      const urlCode = shortid.generate()
      const domain = req.protocol + '://' + req.get('host')
      data.shortUrl = domain + '/' + urlCode
      data.urlCode = urlCode
      //invoking the Url model and saving to the DB
      //console.log(data)
      let redis = await SET_ASYNC(`${data.longUrl}`, JSON.stringify(data))
      let dt = JSON.parse(redis)
      console.log(dt)

      let url = await UrlModel.create(data)
      res.status(201).send({ status: true, msg: { longUrl: url.longUrl, shortUrl: url.shortUrl, urlCode: url.urlCode } })

    }
    else {
      res.status(401).json({ status: false, message: 'Invalid longUrl' })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}


const geturl = async function (req, res) {  //
  try {
    let urlCode = req.params.urlCode
    let url = await GET_ASYNC(`${urlCode}`)
    console.log("found in redis:", url)
    let data = JSON.parse(url)
    if (url) {
      res.status(302).redirect(data.longUrl)
    }
    else {
      const url = await UrlModel.findOne({ urlCode })
      if (!url) return res.status(404).json({ status: false, message: 'No URL Found' })
      await SET_ASYNC(`${urlCode}`, JSON.stringify(url))

      return res.status(302).redirect(url.longUrl) // when valid we perform a redirect
    }

  }
  catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}


module.exports.urlCreate = urlCreate
module.exports.geturl = geturl