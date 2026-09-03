import Report from "../models/Report.js";

function canChange(report, user) {
  return report.author.toString() === user._id.toString() || user.role === "admin";
}

function sendRealtimeUpdate(req, action, reportId) {
  const io = req.app.get("io");
  io.emit("report:changed", { action, reportId });
}

export async function getReports(req, res, next) {
  try {
    const { search = "", status = "", priority = "" } = req.query;
    const filter = {};

    if (search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { room: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (["aperta", "in-lavorazione", "risolta"].includes(status)) {
      filter.status = status;
    }

    if (["bassa", "media", "alta"].includes(priority)) {
      filter.priority = priority;
    }

    const reports = await Report.find(filter)
      .populate("author", "name role")
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
}

export async function getReportById(req, res, next) {
  try {
    const report = await Report.findById(req.params.id).populate("author", "name role");

    if (!report) {
      return res.status(404).json({ message: "Segnalazione non trovata" });
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
}

export async function getStats(req, res, next) {
  try {
    const grouped = await Report.aggregate([
      { $group: { _id: "$status", total: { $sum: 1 } } },
    ]);

    const stats = { aperta: 0, "in-lavorazione": 0, risolta: 0 };
    grouped.forEach((item) => {
      stats[item._id] = item.total;
    });

    res.json({ stats });
  } catch (error) {
    next(error);
  }
}

export async function createReport(req, res, next) {
  try {
    const { title, description, room, priority } = req.body;

    if (!title || !description || !room) {
      return res.status(400).json({ message: "Titolo, descrizione e aula sono obbligatori" });
    }

    const report = await Report.create({
      title,
      description,
      room,
      priority,
      author: req.user._id,
    });

    const populatedReport = await report.populate("author", "name role");
    sendRealtimeUpdate(req, "created", report._id.toString());
    res.status(201).json({ report: populatedReport });
  } catch (error) {
    next(error);
  }
}

export async function updateReport(req, res, next) {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Segnalazione non trovata" });
    }

    if (!canChange(report, req.user)) {
      return res.status(403).json({ message: "Non puoi modificare questa segnalazione" });
    }

    const editableFields = ["title", "description", "room", "priority", "status"];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) report[field] = req.body[field];
    });

    await report.save();
    const populatedReport = await report.populate("author", "name role");
    sendRealtimeUpdate(req, "updated", report._id.toString());
    res.json({ report: populatedReport });
  } catch (error) {
    next(error);
  }
}

export async function deleteReport(req, res, next) {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Segnalazione non trovata" });
    }

    if (!canChange(report, req.user)) {
      return res.status(403).json({ message: "Non puoi eliminare questa segnalazione" });
    }

    await report.deleteOne();
    sendRealtimeUpdate(req, "deleted", report._id.toString());
    res.json({ message: "Segnalazione eliminata" });
  } catch (error) {
    next(error);
  }
}
