import Message from "../models/Message.js";

// @desc    Create new message
// @route   POST /api/messages
// @access  Public
export const createMessage = async (req, res) => {
  try {
    const {
      moduleName,
      category,
      university,
      studentsCount,
      preferredTime,
      message,
      source,
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const newMessage = new Message({
      moduleName,
      category,
      university: university || "N/A",
      studentsCount,
      preferredTime,
      message,
      source,
    });

    const savedMsg = await newMessage.save();
    res.status(201).json(savedMsg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all messages
// @route   GET /api/messages
// @access  Public
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Approve a message from Tutor
// @route   PUT /api/messages/:id/approve
// @access  Public
export const approveMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the original tutor message
    const tutorMsg = await Message.findById(id);
    if (!tutorMsg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Mark it as approved
    tutorMsg.status = "approved";
    await tutorMsg.save();

    // Generate the automatic confirmation to Tutor Management
    const autoResponse = new Message({
      moduleName: tutorMsg.moduleName,
      category: tutorMsg.category,
      university: tutorMsg.university,
      studentsCount: tutorMsg.studentsCount,
      preferredTime: tutorMsg.preferredTime,
      message: "You have been selected for this request.",
      source: "Dashboard",
      status: "approved", // implicitly approved since it comes from Dashboard
    });

    await autoResponse.save();

    res.json({ message: "Approved successfully", approvedMessage: tutorMsg, autoResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
