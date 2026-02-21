// PageShell (preferred — replaces withTeacherLayout HOC)
export { TeacherPageShell } from './shared/TeacherPageShell';
export type { TeacherPageShellProps } from './shared/TeacherPageShell';

// Monitoring Components
export { StudentMonitoringPanel } from './monitoring/StudentMonitoringPanel';
export { StudentStatusCard } from './monitoring/StudentStatusCard';
export { StudentDetailModal } from './monitoring/StudentDetailModal';

// Assignment Components
export { AssignmentCreator } from './assignments/AssignmentCreator';
export { AssignmentWizard } from './assignments/AssignmentWizard';
export { AssignmentList } from './assignments/AssignmentList';

// Progress Components
export { ClassProgressDashboard } from './progress/ClassProgressDashboard';
export { ProgressChart } from './progress/ProgressChart';
export { ModuleCompletionCard } from './progress/ModuleCompletionCard';

// Alert Components
export { InterventionAlertsPanel } from './alerts/InterventionAlertsPanel';

// Analytics Components
export { LearningAnalyticsDashboard } from './analytics/LearningAnalyticsDashboard';
export { PerformanceInsightsPanel } from './analytics/PerformanceInsightsPanel';
export { EngagementMetricsChart } from './analytics/EngagementMetricsChart';

// Report Components
export { ReportGenerator } from './reports/ReportGenerator';
export { ReportTemplateSelector } from './reports/ReportTemplateSelector';

// Collaboration Components
export { ParentCommunicationHub } from './collaboration/ParentCommunicationHub';
export { ResourceSharingPanel } from './collaboration/ResourceSharingPanel';
