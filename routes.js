const { Router } = require("express");

const SendMessageController = require("./controller/SendMessageController");

const router = Router();

router.post("/send", SendMessageController.sendMessage);

module.exports = router;
