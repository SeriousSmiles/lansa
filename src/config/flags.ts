// Feature flags for gradual rollout and instant rollback capability
export const FLAGS = {
  routeGuardsV2: true,          // flip to false to rollback all guards
  softGateOnboarding: true,     // if false => hard block on incomplete onboarding
};
