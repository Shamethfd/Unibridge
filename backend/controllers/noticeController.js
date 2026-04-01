import Notice from '../models/Notice.js';

export const createNotice = async (req, res) => {
  try {
    const { title, content, targetAudience, module, scheduledAt } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const notice = new Notice({
      title, content, targetAudience, module,
      scheduledAt: scheduledAt || null,
      isPublished: true,
    });
    await notice.save();
    res.status(201).json({ message: 'Notice created successfully', notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotices = async (req, res) => {
  try {
    const { search, target, archived } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (target && target !== 'all') query.targetAudience = target;
    query.isArchived = archived === 'true' ? true : false;
    const notices = await Notice.find(query).sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.status(200).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.status(200).json({ message: 'Notice updated', notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const archiveNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id, { isArchived: true }, { new: true }
    );
    res.status(200).json({ message: 'Notice archived', notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markViewed = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { viewedBy: req.body.userId } },
      { new: true }
    );
    res.status(200).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const total = await Notice.countDocuments();
    const published = await Notice.countDocuments({ isPublished: true });
    const archived = await Notice.countDocuments({ isArchived: true });
    const active = await Notice.countDocuments({ isArchived: false });
    const notices = await Notice.find({}, 'title viewedBy createdAt targetAudience');
    const viewStats = notices.map(n => ({
      title: n.title,
      views: n.viewedBy.length,
      target: n.targetAudience,
      date: n.createdAt,
    }));
    res.status(200).json({ total, published, archived, active, viewStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};