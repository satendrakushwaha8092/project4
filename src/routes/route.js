const express = require('express');
const router = express.Router();
const urlController = require("../controller/urlController")

router.post("/url/shorten", urlController.urlCreate)

router.get("/:urlCode", urlController.geturl)




module.exports = router;