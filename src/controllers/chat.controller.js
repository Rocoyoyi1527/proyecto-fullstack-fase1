const aiChatService = require('../services/aiChat.service');

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message (string) es requerido' });
    }

    const userId = req.usuario?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const result = await aiChatService.handleChat({ userId, message });
    return res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
