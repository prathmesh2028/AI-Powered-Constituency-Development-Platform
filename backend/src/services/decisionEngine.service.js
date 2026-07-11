import Decision from "../models/decision.model.js";

/**
 * Deterministic Rule Engine (Mitigation Matrix)
 * Evaluates a citizen's suggestion based on category, priority score, and description keywords.
 * Returns an array of decision payloads (not saved to database yet).
 *
 * @param {Object} suggestion - Suggestion object from MongoDB
 * @returns {Array<Object>} List of evaluated decision objects
 */
export const evaluateSuggestion = (suggestion) => {
  if (!suggestion) return [];

  const title = (suggestion.title || "").toLowerCase();
  const desc = (suggestion.description || "").toLowerCase();
  const text = `${title} ${desc}`;
  const category = (suggestion.category || "other").toLowerCase();
  const score = suggestion.priorityScore || 5;
  const village = suggestion.village || "";
  const constituency = suggestion.constituency;

  const locationStr = village ? `${village} village, ${constituency}` : constituency;
  const decisions = [];

  // 1. Open Gates
  const openGatesKeywords = ["flood", "flooding", "water logging", "rain", "overflow", "clogged drain", "sluice", "canal gate", "waterlogging"];
  if (openGatesKeywords.some(keyword => text.includes(keyword)) && score >= 7) {
    decisions.push({
      suggestionId: suggestion._id,
      constituency,
      village,
      action: "Open Gates",
      decision: `Initiate immediate opening of sluice and drainage gates in ${locationStr}.`,
      reason: `Severe water logging or flooding risk detected (Severity: ${score}/10).`,
      expectedImpact: "Enable high-volume water drainage and prevent low-lying street inundation.",
      responsibleTeam: "Municipal Drainage & Flood Response Team",
      eta: "2 hours",
      status: "pending"
    });
  }

  // 2. Close Gates
  const closeGatesKeywords = ["security threat", "contamination hazard", "spill", "toxic", "chemical spill", "active flood danger", "lockdown", "unauthorized access", "close park"];
  if (closeGatesKeywords.some(keyword => text.includes(keyword)) && score >= 8) {
    decisions.push({
      suggestionId: suggestion._id,
      constituency,
      village,
      action: "Close Gates",
      decision: `Authorize the temporary closure of containment gates, park entryways, or water intake valves in ${locationStr}.`,
      reason: `Critical safety threat or water contamination hazard detected (Severity: ${score}/10).`,
      expectedImpact: "Isolate the contaminated area or source and secure the immediate perimeter.",
      responsibleTeam: "Public Safety & Health Containment Unit",
      eta: "1 hour",
      status: "pending"
    });
  }

  // 3. Medical Escalation
  const medicalKeywords = ["injury", "accident", "medical", "hospital power", "disease", "ambulance", "doctor", "fever", "outbreak", "clinic", "health center"];
  if (category === "health" || medicalKeywords.some(keyword => text.includes(keyword))) {
    decisions.push({
      suggestionId: suggestion._id,
      constituency,
      village,
      action: "Medical Escalation",
      decision: `Dispatch emergency paramedic units, ambulance services, or auxiliary power support to medical facilities in ${locationStr}.`,
      reason: `Medical emergency, disease outbreak risk, or hospital utility failure reported (Severity: ${score}/10).`,
      expectedImpact: "Provide emergency medical care, contain health risks, and sustain medical operations.",
      responsibleTeam: "Emergency Health & Paramedic Response Unit",
      eta: "3 hours",
      status: "pending"
    });
  }

  // 4. Transport Diversion
  const transportKeywords = ["road blocked", "landslide", "bridge damage", "traffic jam", "accident on highway", "detour", "flyover block", "highway repair", "pothole"];
  if (category === "infrastructure" && transportKeywords.some(keyword => text.includes(keyword))) {
    decisions.push({
      suggestionId: suggestion._id,
      constituency,
      village,
      action: "Transport Diversion",
      decision: `Establish traffic detours and redirect public transit lines around blocked roads/bridges in ${locationStr}.`,
      reason: `Significant roadway blockage, accidents, or structural safety risks (Severity: ${score}/10).`,
      expectedImpact: "Prevent severe gridlock, secure commuter safety, and maintain transit routing flow.",
      responsibleTeam: "Municipal Traffic Control & Highway Police",
      eta: "2 hours",
      status: "pending"
    });
  }

  // 5. Parking Redirection
  const parkingKeywords = ["pedestrian congestion", "market traffic", "station road crowd", "hawkers blocking", "parking lot", "street market congestion", "double-parking", "unauthorized hawkers"];
  if (parkingKeywords.some(keyword => text.includes(keyword))) {
    decisions.push({
      suggestionId: suggestion._id,
      constituency,
      village,
      action: "Parking Redirection",
      decision: `Deploy traffic wardens to clear main lanes and redirect commercial/shopper vehicles to designated peripheral parking lots in ${locationStr}.`,
      reason: `Heavy pedestrian congestion or vehicle parking blockages reported (Severity: ${score}/10).`,
      expectedImpact: "Reclaim roadway lanes, improve pedestrian walking access, and ease local market bottlenecks.",
      responsibleTeam: "Constituency Parking Administration & Wardens",
      eta: "4 hours",
      status: "pending"
    });
  }

  // 6. Broadcast Messages
  const broadcastKeywords = ["power outage", "water supply cut", "load shedding", "grid fail", "epidemic", "outbreak", "alert", "public warning", "contamination", "pipeline leak"];
  if (score >= 8 || broadcastKeywords.some(keyword => text.includes(keyword))) {
    decisions.push({
      suggestionId: suggestion._id,
      constituency,
      village,
      action: "Broadcast Messages",
      decision: `Deploy high-priority constituency SMS and push notification alerts to residents in ${locationStr}.`,
      reason: `High severity alert or utility failure (Severity: ${score}/10) requires immediate citizen messaging.`,
      expectedImpact: "Notify citizens of outages or emergency warnings to reduce panic and enable early preparation.",
      responsibleTeam: "Public Relations & Citizen Alert Office",
      eta: "30 minutes",
      status: "pending"
    });
  }

  // 7. Dispatch Volunteers
  const volunteerKeywords = ["garbage", "trash", "clean", "clogged", "paint", "planting", "volunteer", "help", "cleanup", "litter", "silt"];
  if (category === "community" || score >= 5 || volunteerKeywords.some(keyword => text.includes(keyword))) {
    decisions.push({
      suggestionId: suggestion._id,
      constituency,
      village,
      action: "Dispatch Volunteers",
      decision: `Mobilize the Civic Volunteer Corps to provide clean-up, repair, and relief assistance in ${locationStr}.`,
      reason: `General civic improvement or local grievance recovery requires hands-on support (Severity: ${score}/10).`,
      expectedImpact: "Provide immediate community manpower to restore public areas and clear surface blockages.",
      responsibleTeam: "Civic Action & Volunteer Coordination Unit",
      eta: "12 hours",
      status: "pending"
    });
  }

  return decisions;
};

/**
 * Evaluates a suggestion, logs new decisions to the database, and returns them.
 * Logs every decision. Avoids logging duplicate actions for the same suggestion.
 *
 * @param {Object} suggestion - Suggestion object
 * @returns {Promise<Array>} List of logged decisions
 */
export const evaluateAndLogDecisionsForSuggestion = async (suggestion) => {
  if (!suggestion) return [];
  
  const evaluated = evaluateSuggestion(suggestion);
  const loggedDecisions = [];

  for (const decisionData of evaluated) {
    // Check if we already logged this specific action for this suggestion to avoid duplication
    const exists = await Decision.findOne({
      suggestionId: suggestion._id,
      action: decisionData.action
    });

    if (!exists) {
      const decision = new Decision(decisionData);
      await decision.save();
      console.log(`[Decision Engine Logged] Decision: ${decision.action} for suggestion ID: ${suggestion._id} in ${decision.constituency}`);
      loggedDecisions.push(decision);

      // Broadcast via WebSockets
      if (global.wss) {
        global.wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "NEW_DECISION",
              data: decision
            }));
          }
        });
      }
    } else {
      loggedDecisions.push(exists);
    }
  }

  return loggedDecisions;
};

/**
 * Fetch logged decisions with optional filtering
 *
 * @param {Object} filters - filters (constituency, status)
 * @returns {Promise<Array>} List of decisions
 */
export const getDecisions = async (filters = {}) => {
  const query = {};
  if (filters.constituency) query.constituency = filters.constituency;
  if (filters.status) query.status = filters.status;

  return await Decision.find(query)
    .sort({ createdAt: -1 })
    .populate("suggestionId", "title category village description")
    .lean();
};

/**
 * Update decision status (Execute or Cancel)
 *
 * @param {String} id - Decision ID
 * @param {String} status - status ('pending', 'executed', 'cancelled')
 * @returns {Promise<Object>} Updated decision
 */
export const updateDecisionStatus = async (id, status) => {
  const updatedDecision = await Decision.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("suggestionId", "title category village").lean();

  if (updatedDecision && global.wss) {
    global.wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: "DECISION_UPDATE",
          data: updatedDecision
        }));
      }
    });
  }

  return updatedDecision;
};
