const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  async sendMessage(req, res) {
    const { message, number } = req.body;

    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_NUMBER,
        to: `+55${number}`, // meu numero cadastrado
        /**
         * Para fazer envio para outros numeros é necessário adquirir a versão paga
         */
      });

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  },
};
