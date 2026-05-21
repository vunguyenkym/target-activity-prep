// Canonical checklist items sourced from the Adobe Target Use Case Framework PDF
// and the Adobe Target Governance deck. Order here is the order shown in the UI.

export type QaItemId =
  | 'staging'
  | 'production'
  | 'previewLinks'
  | 'mboxTrace'
  | 'regression'
  | 'errorLogging'
  | 'rollbackPlan'
  | 'realtimeMonitoring'
  | 'audienceQual'
  | 'metricFiring'
  | 'suppression';

export const QA_ITEMS: { id: QaItemId; label: string; helper: string }[] = [
  {
    id: 'staging',
    label: 'QA passed in staging',
    helper:
      'All variants tested end-to-end on staging using Adobe Target preview links.',
  },
  {
    id: 'production',
    label: 'Pre-launch smoke test in production',
    helper:
      'Quick smoke pass in production before traffic is allocated, to catch any environment-specific issues.',
  },
  {
    id: 'previewLinks',
    label: 'Adobe Target preview / QA links shared with stakeholders',
    helper:
      'Activity QA URLs shared with the team for independent verification.',
  },
  {
    id: 'mboxTrace',
    label: 'mbox trace verified',
    helper:
      'mbox firing checked via dev tools to confirm payload and that the activity is delivered.',
  },
  {
    id: 'regression',
    label: 'Device & browser regression (Safari included)',
    helper:
      "Behaviour confirmed across the target device/browser matrix — Safari's cookie persistence in particular.",
  },
  {
    id: 'errorLogging',
    label: 'Error logging in place',
    helper:
      'Console logging or error tracking added so issues surface during the run.',
  },
  {
    id: 'rollbackPlan',
    label: 'Rollback plan documented',
    helper:
      'Clear path to pause or deactivate the activity if it goes wrong post-launch.',
  },
  {
    id: 'realtimeMonitoring',
    label: 'Real-time monitoring set up',
    helper:
      'Adobe Target reports or Adobe Analytics dashboards configured to spot traffic anomalies during the run.',
  },
  {
    id: 'audienceQual',
    label: 'Audience qualification validated',
    helper:
      'Confirmed visitors who should qualify do, and those who should not, don’t.',
  },
  {
    id: 'metricFiring',
    label: 'Metric firing validated',
    helper:
      'Primary and secondary metric events fire on the expected actions, in both control and variants.',
  },
  {
    id: 'suppression',
    label: 'Suppression rules tested (if applicable)',
    helper:
      'For coordinated activities, confirmed exclusions/suppressions work between AJO, paid media, and Adobe Target.',
  },
];

export type LaunchItemId =
  | 'launchedCorrectTargeting'
  | 'reportsSetUp'
  | 'a4tVerified'
  | 'trafficSplitConfirmed'
  | 'midTestQa'
  | 'anomalyHandling'
  | 'weeklySyncScheduled';

export const LAUNCH_ITEMS: { id: LaunchItemId; label: string; helper: string }[] =
  [
    {
      id: 'launchedCorrectTargeting',
      label: 'Launched with correct audience targeting',
      helper:
        'Activity is live with the audience and URL targeting agreed in Phase 1.',
    },
    {
      id: 'reportsSetUp',
      label: 'Adobe Target reports configured',
      helper:
        'Reports for primary, secondary and guardrail metrics are set up and visible.',
    },
    {
      id: 'a4tVerified',
      label: 'A4T integration verified (if used)',
      helper:
        'Analytics-for-Target integration confirmed firing if the activity reports via A4T.',
    },
    {
      id: 'trafficSplitConfirmed',
      label: 'Traffic split confirmed even',
      helper:
        'Reports show the agreed split (e.g., 50/50) within the first few hours — flag bias early.',
    },
    {
      id: 'midTestQa',
      label: 'Mid-test QA completed',
      helper:
        'Variants and tracking re-verified after launch to catch any post-deploy regressions.',
    },
    {
      id: 'anomalyHandling',
      label: 'Anomaly-handling process in place',
      helper:
        'Owner identified for triaging any spikes, errors, or unexpected drops during the run.',
    },
    {
      id: 'weeklySyncScheduled',
      label: 'Weekly stakeholder sync scheduled',
      helper:
        'Cadence for sharing test updates set with stakeholders — per the governance model.',
    },
  ];
