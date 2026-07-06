/**
 * Issue Controller
 *
 * Handles HTTP request/response logic for constituency issues.
 * Controllers should:
 *  - Extract data from req (params, body, query)
 *  - Call the appropriate service
 *  - Send the response
 *  - NOT contain business logic or DB queries directly
 */

import * as issueService from "../services/issue.service.js";
import catchAsync from "../utils/catchAsync.js";

export const createIssue = catchAsync(async (req, res) => {
  const issue = await issueService.createIssue(req.body);
  res.status(201).json({ success: true, data: issue });
});

export const getIssues = catchAsync(async (req, res) => {
  const paginatedResult = await issueService.getIssues(req.query);
  res.status(200).json({ success: true, ...paginatedResult });
});

export const getIssueById = catchAsync(async (req, res) => {
  const issue = await issueService.getIssueById(req.params.id);
  if (!issue) {
    return res.status(404).json({ success: false, message: "Issue not found" });
  }
  res.status(200).json({ success: true, data: issue });
});

export const updateIssue = catchAsync(async (req, res) => {
  const issue = await issueService.updateIssue(req.params.id, req.body);
  if (!issue) {
    return res.status(404).json({ success: false, message: "Issue not found" });
  }
  res.status(200).json({ success: true, data: issue });
});

export const deleteIssue = catchAsync(async (req, res) => {
  const issue = await issueService.deleteIssue(req.params.id);
  if (!issue) {
    return res.status(404).json({ success: false, message: "Issue not found" });
  }
  res.status(200).json({ success: true, message: "Issue deleted successfully" });
});
