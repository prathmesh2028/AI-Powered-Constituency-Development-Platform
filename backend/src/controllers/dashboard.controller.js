import * as dashboardService from "../services/dashboard.service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.query);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getDashboardCategories = async (req, res, next) => {
  try {
    const categories = await dashboardService.getDashboardCategories(req.query);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getSuggestionDashboard = async (req, res, next) => {
  try {
    const dashboardData = await dashboardService.getSuggestionDashboardData(req.query);
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    next(error);
  }
};
