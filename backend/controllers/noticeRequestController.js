import NoticeRequest from '../models/NoticeRequestModel.js';
import Notice from '../models/Notice.js';

// Create a new request
export const createRequest = async (req, res) => {
  try {
    const { title, content, module, targetAudience, requestedBy, role } = req.body;
    if (!title || !content || !requestedBy || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const request = new NoticeRequest({
      title, content, module, targetAudience, requestedBy, role
    });
    await request.save();
    res.status(201).json({ message: 'Request submitted successfully', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all requests
export const getRequests = async (req, res) => {
  try {
    const requests = await NoticeRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve request
export const approveRequest = async (req, res) => {
  try {
    const request = await NoticeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Create notice from request
    const notice = new Notice({
      title: request.title,
      content: request.content,
      module: request.module,
      targetAudience: request.targetAudience,
      isPublished: true,
    });
    await notice.save();

    // Update request status
    request.status = 'approved';
    await request.save();

    res.status(200).json({ message: 'Request approved and notice published', notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reject request
export const rejectRequest = async (req, res) => {
  try {
    const request = await NoticeRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.status(200).json({ message: 'Request rejected', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete request
export const deleteRequest = async (req, res) => {
  try {
    await NoticeRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};