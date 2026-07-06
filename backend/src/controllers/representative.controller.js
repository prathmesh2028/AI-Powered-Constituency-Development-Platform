/**
 * Representative Controller
 *
 * Handles HTTP request/response logic for elected representatives.
 */

import * as representativeService from "../services/representative.service.js";
import catchAsync from "../utils/catchAsync.js";

export const getRepresentatives = catchAsync(async (req, res) => {
  const paginatedResult = await representativeService.getRepresentatives(req.query);
  res.status(200).json({ success: true, ...paginatedResult });
});

export const getRepresentativeById = catchAsync(async (req, res) => {
  const rep = await representativeService.getRepresentativeById(req.params.id);
  if (!rep) {
    return res.status(404).json({ success: false, message: "Representative not found" });
  }
  res.status(200).json({ success: true, data: rep });
});

export const createRepresentative = catchAsync(async (req, res) => {
  const rep = await representativeService.createRepresentative(req.body);
  res.status(201).json({ success: true, data: rep });
});

export const updateRepresentative = catchAsync(async (req, res) => {
  const rep = await representativeService.updateRepresentative(req.params.id, req.body);
  if (!rep) {
    return res.status(404).json({ success: false, message: "Representative not found" });
  }
  res.status(200).json({ success: true, data: rep });
});

export const deleteRepresentative = catchAsync(async (req, res) => {
  const rep = await representativeService.deleteRepresentative(req.params.id);
  if (!rep) {
    return res.status(404).json({ success: false, message: "Representative not found" });
  }
  res.status(200).json({ success: true, message: "Representative deleted successfully" });
});
