/**
 * MVPLaunch NG - Scope, Problem & Customer Repository
 */
const db = require('../../config/db');

class ScopeRepository {
  async upsertProblemClarification({ ideaId, coreProblem, alternativeSolutions, uniqueValueProp, whyNow, monetizationHypothesis, reviewedBy }) {
    const res = await db.query(
      `INSERT INTO problem_clarifications 
        (idea_id, core_problem, alternative_solutions, unique_value_prop, why_now, monetization_hypothesis, reviewed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (idea_id) DO UPDATE SET
         core_problem = EXCLUDED.core_problem,
         alternative_solutions = EXCLUDED.alternative_solutions,
         unique_value_prop = EXCLUDED.unique_value_prop,
         why_now = EXCLUDED.why_now,
         monetization_hypothesis = EXCLUDED.monetization_hypothesis,
         reviewed_by = EXCLUDED.reviewed_by
       RETURNING *`,
      [ideaId, coreProblem, alternativeSolutions, uniqueValueProp, whyNow, monetizationHypothesis, reviewedBy]
    );
    return res.rows[0];
  }

  async getProblemByIdeaId(ideaId) {
    const res = await db.query('SELECT * FROM problem_clarifications WHERE idea_id = $1', [ideaId]);
    return res.rows[0] || null;
  }

  async upsertCustomerDefinition({ ideaId, primaryPersona, painPoints, distributionChannel, userArchetype, locationContext }) {
    const res = await db.query(
      `INSERT INTO customer_definitions 
        (idea_id, primary_persona, pain_points, distribution_channel, user_archetype, location_context)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (idea_id) DO UPDATE SET
         primary_persona = EXCLUDED.primary_persona,
         pain_points = EXCLUDED.pain_points,
         distribution_channel = EXCLUDED.distribution_channel,
         user_archetype = EXCLUDED.user_archetype,
         location_context = EXCLUDED.location_context
       RETURNING *`,
      [ideaId, primaryPersona, painPoints, distributionChannel, userArchetype, locationContext]
    );
    return res.rows[0];
  }

  async getCustomerByIdeaId(ideaId) {
    const res = await db.query('SELECT * FROM customer_definitions WHERE idea_id = $1', [ideaId]);
    return res.rows[0] || null;
  }

  async upsertMvpScope({ ideaId, mustHaveFeatures, outOfScopeFeatures, techStackPreferences, targetLaunchDate, complexityRating, estimatedWeeks }) {
    const res = await db.query(
      `INSERT INTO mvp_scopes 
        (idea_id, must_have_features, out_of_scope_features, tech_stack_preferences, target_launch_date, complexity_rating, estimated_weeks)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (idea_id) DO UPDATE SET
         must_have_features = EXCLUDED.must_have_features,
         out_of_scope_features = EXCLUDED.out_of_scope_features,
         tech_stack_preferences = EXCLUDED.tech_stack_preferences,
         target_launch_date = EXCLUDED.target_launch_date,
         complexity_rating = EXCLUDED.complexity_rating,
         estimated_weeks = EXCLUDED.estimated_weeks
       RETURNING *`,
      [
        ideaId,
        JSON.stringify(mustHaveFeatures),
        JSON.stringify(outOfScopeFeatures),
        JSON.stringify(techStackPreferences),
        targetLaunchDate || null,
        complexityRating,
        estimatedWeeks
      ]
    );
    return res.rows[0];
  }

  async getScopeByIdeaId(ideaId) {
    const res = await db.query('SELECT * FROM mvp_scopes WHERE idea_id = $1', [ideaId]);
    return res.rows[0] || null;
  }
}

module.exports = new ScopeRepository();
