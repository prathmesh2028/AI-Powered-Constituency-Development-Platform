/**
 * Recommendation Engine
 * 
 * Modular business logic to calculate Priority Scores and generate actionable recommendations
 * based on Citizen Suggestions and AI Analysis data.
 */

// Weights for the scoring algorithm
const WEIGHTS = {
  AI_BASE_SCORE: 0.6,
  SENTIMENT_NEGATIVE: 2.0, // Urgency multiplier for negative sentiment
  SENTIMENT_NEUTRAL: 1.0,
  SENTIMENT_POSITIVE: 0.5, // Less urgent if positive (praise)
  VOLUME_BOOST_PER_ISSUE: 0.5 // Add 0.5 to score for every related issue in the same category
};

/**
 * Calculates the final priority score and generates a recommendation.
 * 
 * @param {Array} suggestions - Array of citizen suggestion objects (same category/constituency)
 * @param {Object} aiAnalysis - AI Analysis object (contains sentiment, priorityScore)
 * @returns {Object} { priorityScore, reason, recommendationText }
 */
export const generateRecommendation = (suggestions, aiAnalysis) => {
  if (!suggestions || suggestions.length === 0) {
    throw new Error("At least one suggestion is required to generate a recommendation");
  }

  // 1. Calculate Volume Boost
  // The more people complain about the same thing, the higher the priority
  const volumeBoost = (suggestions.length - 1) * WEIGHTS.VOLUME_BOOST_PER_ISSUE;

  // 2. Apply Sentiment Multiplier
  let sentimentMultiplier = WEIGHTS.SENTIMENT_NEUTRAL;
  if (aiAnalysis.sentiment === "negative") sentimentMultiplier = WEIGHTS.SENTIMENT_NEGATIVE;
  if (aiAnalysis.sentiment === "positive") sentimentMultiplier = WEIGHTS.SENTIMENT_POSITIVE;

  // 3. Calculate Final Score (Base AI Score * Sentiment) + Volume Boost
  let finalScore = (aiAnalysis.priorityScore * sentimentMultiplier) + volumeBoost;
  
  // Cap the score at 10 (or 100 depending on the scale, we'll use 10 for consistency)
  finalScore = Math.min(Math.max(finalScore, 1), 10);
  // Round to 1 decimal place
  finalScore = Math.round(finalScore * 10) / 10;

  // 4. Generate Reason
  const suggestionCount = suggestions.length;
  const category = suggestions[0].category || "general";
  const reason = `Score of ${finalScore}/10 based on ${suggestionCount} report(s) concerning '${category}'. AI detected ${aiAnalysis.sentiment} sentiment with an initial severity of ${aiAnalysis.priorityScore}.`;

  // 5. Generate Actionable Recommendation
  let recommendationText = "";
  if (finalScore >= 8) {
    recommendationText = "CRITICAL: Immediate representative intervention required. Escalate to municipal authorities within 24 hours.";
  } else if (finalScore >= 5) {
    recommendationText = "MODERATE: Schedule for review in the upcoming town hall or committee meeting.";
  } else {
    recommendationText = "LOW: Monitor the situation. Log for future budget allocation if volume increases.";
  }

  return {
    priorityScore: finalScore,
    reason,
    recommendation: recommendationText
  };
};
