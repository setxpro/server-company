const { Router } = require("express");

const SendMessageController = require("./Controller/SendMessageController");

const router = Router();

router.post("/send", SendMessageController.sendMessage);

module.exports = router;
