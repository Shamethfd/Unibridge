import Module from '../models/Module.js';

// Legacy query-based listing: /api/modules?year=1&semester=1
export const getModulesByYearSemester = async (req, res) => {
  try {
    const { year, semester, page = 1, limit = 10 } = req.query;

    const query = {};
    if (year) query.year = parseInt(year, 10);
    if (semester) query.semester = parseInt(semester, 10);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const modules = await Module.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Module.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        modules,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching modules', error: error.message });
  }
};

// Semester-based listing: /api/modules/:semesterId
export const getModulesBySemester = async (req, res) => {
  try {
    const modules = await Module.find({ semesterId: req.params.semesterId }).sort({ requestCount: -1, createdAt: -1 });
    res.status(200).json(modules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createModule = async (req, res) => {
  try {
    const payload = {
      name: req.body.name?.trim(),
      year: req.body.year !== undefined && req.body.year !== '' ? parseInt(req.body.year, 10) : undefined,
      semester: req.body.semester !== undefined && req.body.semester !== '' ? parseInt(req.body.semester, 10) : undefined,
      semesterId: req.body.semesterId || undefined,
      description: req.body.description || '',
      requestCount: req.body.requestCount || 0,
      createdBy: req.user?._id || undefined
    };

    if (!payload.name) {
      return res.status(400).json({ success: false, message: 'Module name is required' });
    }

    if (!payload.semesterId && (payload.year === undefined || payload.semester === undefined)) {
      return res.status(400).json({ success: false, message: 'Provide either semesterId or both year and semester' });
    }

    const duplicateQuery = payload.semesterId
      ? { name: payload.name, semesterId: payload.semesterId }
      : { name: payload.name, year: payload.year, semester: payload.semester };

    const existing = await Module.findOne(duplicateQuery);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Module already exists for this context' });
    }

    const module = await Module.create(payload);

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: { module }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate module detected' });
    }
    res.status(500).json({ success: false, message: 'Server error creating module', error: error.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.name !== undefined) updates.name = updates.name.trim();
    if (updates.year !== undefined && updates.year !== '') updates.year = parseInt(updates.year, 10);
    if (updates.semester !== undefined && updates.semester !== '') updates.semester = parseInt(updates.semester, 10);

    const updatedModule = await Module.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'username profile.firstName profile.lastName');

    if (!updatedModule) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.status(200).json({ success: true, message: 'Module updated successfully', data: { module: updatedModule } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating module', error: error.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    await Module.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting module', error: error.message });
  }
};

export const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('createdBy', 'username profile.firstName profile.lastName');

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.status(200).json({ success: true, data: { module } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching module', error: error.message });
  }
};
