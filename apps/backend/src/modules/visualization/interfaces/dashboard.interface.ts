/**
 * Dashboard Interfaces
 *
 * @description Interfaces for dashboard layouts, widgets, and configurations.
 * Supports role-based dashboards for students, teachers, parents, and admins.
 *
 * @module visualization/interfaces
 * @version 1.0.0
 * @since Sprint 4 - EXT-005 Visualizations
 */

/**
 * Widget Types
 * @description Available widget types for dashboard composition
 */
export enum WidgetType {
  /** Chart widget (uses ChartConfig) */
  CHART = 'chart',

  /** Key Performance Indicator display */
  KPI = 'kpi',

  /** Data table widget */
  TABLE = 'table',

  /** Simple list widget */
  LIST = 'list',

  /** Progress bar/indicator */
  PROGRESS = 'progress',

  /** Calendar/schedule widget */
  CALENDAR = 'calendar',

  /** Map/geographic widget */
  MAP = 'map',

  /** Static text/markdown widget */
  TEXT = 'text',

  /** Alert/notification widget */
  ALERT = 'alert',

  /** Ranked list/leaderboard */
  LEADERBOARD = 'leaderboard',
}

/**
 * Dashboard Scope
 * @description Target audience/role for the dashboard
 */
export enum DashboardScope {
  /** Student personal dashboard */
  STUDENT = 'student',

  /** Teacher classroom dashboard */
  TEACHER = 'teacher',

  /** Parent oversight dashboard */
  PARENT = 'parent',

  /** Administrator dashboard */
  ADMIN = 'admin',

  /** Classroom-wide dashboard */
  CLASSROOM = 'classroom',

  /** Organization-level dashboard */
  ORGANIZATION = 'organization',
}

/**
 * Widget Position
 * @description Grid position and size for a widget
 */
export interface WidgetPosition {
  /** Grid column position */
  x: number;

  /** Grid row position */
  y: number;

  /** Width in grid units */
  width: number;

  /** Height in grid units */
  height: number;

  /** Minimum width constraint */
  minWidth?: number;

  /** Minimum height constraint */
  minHeight?: number;
}

/**
 * Widget Filter
 * @description Filter condition for widget data
 */
export interface WidgetFilter {
  /** Field to filter on */
  field: string;

  /** Filter operator */
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between' | 'like';

  /** Filter value(s) */
  value: unknown;
}

/**
 * Widget Data Source
 * @description Configuration for how widget retrieves its data
 */
export interface WidgetDataSource {
  /** Source type */
  type: 'api' | 'query' | 'computed' | 'static';

  /** API endpoint (for 'api' type) */
  endpoint?: string;

  /** Database query (for 'query' type) */
  query?: string;

  /** Compute function name (for 'computed' type) */
  computeFn?: string;

  /** Static data (for 'static' type) */
  staticData?: unknown;

  /** Query/API parameters */
  params?: Record<string, unknown>;

  /** Data filters */
  filters?: WidgetFilter[];
}

/**
 * Widget Configuration
 * @description Complete configuration for a dashboard widget
 */
export interface WidgetConfig {
  /** Unique widget identifier */
  id: string;

  /** Widget type */
  type: WidgetType;

  /** Display title */
  title: string;

  /** Grid position and size */
  position: WidgetPosition;

  /** Data source configuration */
  dataSource: WidgetDataSource;

  /** Auto-refresh interval in seconds */
  refreshInterval?: number;

  /** Cache time-to-live in seconds */
  cacheTTL?: number;

  /** Required permissions to view */
  permissions?: string[];

  /** Type-specific settings */
  settings?: Record<string, unknown>;
}

/**
 * Widget Data
 * @description Fetched/computed data for a widget
 */
export interface WidgetData {
  /** Widget identifier */
  widgetId: string;

  /** Widget data payload */
  data: unknown;

  /** When data was last updated */
  updatedAt: Date;

  /** Whether data came from cache */
  cacheHit: boolean;
}

/**
 * Dashboard Layout
 * @description Grid layout configuration for a dashboard
 */
export interface DashboardLayout {
  /** Unique layout identifier */
  id: string;

  /** Layout name */
  name: string;

  /** Target scope/audience */
  scope: DashboardScope;

  /** Number of grid columns */
  columns: number;

  /** Height of each grid row in pixels */
  rowHeight: number;

  /** Widgets in this layout */
  widgets: WidgetConfig[];

  /** Whether this is the default layout */
  isDefault?: boolean;

  /** Whether users can customize */
  isCustomizable?: boolean;
}

/**
 * Date Range
 * @description Date range for filtering dashboard data
 */
export interface DateRange {
  /** Range start date */
  start: Date;

  /** Range end date */
  end: Date;

  /** Preset range identifier */
  preset?:
    | 'today'
    | 'yesterday'
    | 'last7days'
    | 'last30days'
    | 'thisMonth'
    | 'lastMonth'
    | 'thisYear'
    | 'custom';
}

/**
 * Dashboard Global Filter
 * @description Filter that applies to all widgets in a dashboard
 */
export interface DashboardGlobalFilter {
  /** Unique filter identifier */
  id: string;

  /** Display label */
  label: string;

  /** Field to filter */
  field: string;

  /** Filter input type */
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'search';

  /** Available options (for select types) */
  options?: { value: string; label: string }[];

  /** Default filter value */
  defaultValue?: unknown;
}

/**
 * Dashboard Configuration
 * @description Complete dashboard definition
 */
export interface DashboardConfig {
  /** Unique dashboard identifier */
  id: string;

  /** Dashboard name */
  name: string;

  /** Dashboard description */
  description?: string;

  /** Target scope/audience */
  scope: DashboardScope;

  /** Dashboard layout */
  layout: DashboardLayout;

  /** Global filters */
  filters?: DashboardGlobalFilter[];

  /** Default date range */
  dateRange?: DateRange;

  /** Auto-refresh interval in seconds */
  refreshInterval?: number;

  /** Required permissions to view */
  permissions?: string[];

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Dashboard Snapshot
 * @description Point-in-time snapshot of dashboard with all widget data
 */
export interface DashboardSnapshot {
  /** Dashboard identifier */
  dashboardId: string;

  /** Dashboard configuration */
  config: DashboardConfig;

  /** All widget data at snapshot time */
  widgetData: WidgetData[];

  /** When snapshot was generated */
  generatedAt: Date;

  /** Time taken to generate in milliseconds */
  generationTime: number;
}
