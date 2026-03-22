import Request from "../models/Request.js";
import Module from "../models/Module.js";

export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("moduleId", "name")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRequestsByModule = async (req, res) => {
  try {
    const requests = await Request.find({ moduleId: req.params.id })
      .populate("moduleId", "name")
      .sort({ heatScore: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { moduleId, category, description } = req.body;

    // Backend validation: description is required
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required.' });
    }

    // Duplicate detection
    const existing = await Request.findOne({ moduleId, category });
    if (existing) {
      return res.status(200).json({
        duplicate: true,
        message: `This request already exists (${existing.studentsCount} student${existing.studentsCount > 1 ? "s" : ""} joined)`,
        request: existing,
      });
    }

    const request = new Request(req.body);
    const saved = await request.save();

    // Increment module's requestCount
    await Module.findByIdAndUpdate(moduleId, { $inc: { requestCount: 1 } });

    res.status(201).json({ duplicate: false, request: saved });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const joinRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.studentsCount += 1;
    await request.save(); // triggers pre-save for heatScore recalc

    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Request not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const byModule = await Request.aggregate([
      {
        $group: {
          _id: "$moduleId",
          moduleName: { $first: "$moduleName" },
          total: { $sum: 1 },
          totalStudents: { $sum: "$studentsCount" },
          avgHeatScore: { $avg: "$heatScore" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    res.json({ totalRequests, byModule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
