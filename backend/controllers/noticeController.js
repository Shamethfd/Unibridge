const Notice = require("../models/Notice");

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
