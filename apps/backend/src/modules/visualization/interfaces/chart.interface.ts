/**
 * Chart Interfaces
 *
 * @description Core interfaces for chart rendering and configuration in GAMILIT.
 * Supports multiple chart types for educational data visualization.
 *
 * @module visualization/interfaces
 * @version 1.0.0
 * @since Sprint 4 - EXT-005 Visualizations
 */

/**
 * Chart Types
 * @description Available chart types for data visualization
 */
export enum ChartType {
  /** Line chart for trends and time series */
  LINE = 'line',

  /** Bar chart for categorical comparisons */
  BAR = 'bar',

  /** Pie chart for proportional data */
  PIE = 'pie',

  /** Doughnut chart (pie variant with center hole) */
  DOUGHNUT = 'doughnut',

  /** Radar chart for multi-dimensional data */
  RADAR = 'radar',

  /** Polar area chart for cyclic data */
  POLAR_AREA = 'polar_area',

  /** Scatter plot for correlation analysis */
  SCATTER = 'scatter',

  /** Bubble chart for 3D data representation */
  BUBBLE = 'bubble',

  /** Heatmap for matrix-style data */
  HEATMAP = 'heatmap',

  /** Treemap for hierarchical data */
  TREEMAP = 'treemap',

  /** Sankey diagram for flow visualization */
  SANKEY = 'sankey',

  /** Gauge chart for KPI display */
  GAUGE = 'gauge',
}

/**
 * Chart Data Point
 * @description Single data point in a chart dataset
 */
export interface ChartDataPoint {
  /** X-axis value (number, string label, or Date) */
  x: number | string | Date;

  /** Y-axis value */
  y: number;

  /** Optional display label */
  label?: string;

  /** Optional additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Chart Dataset
 * @description A single data series within a chart
 */
export interface ChartDataset {
  /** Display label for the dataset */
  label: string;

  /** Data points or raw number values */
  data: ChartDataPoint[] | number[];

  /** Background color(s) for data points */
  backgroundColor?: string | string[];

  /** Border color(s) for data points */
  borderColor?: string | string[];

  /** Whether to fill area under line */
  fill?: boolean;

  /** Line curve tension (0 = straight, 1 = very curved) */
  tension?: number;

  /** Stack group identifier for stacked charts */
  stack?: string;
}

/**
 * Chart Data
 * @description Complete data structure for a chart
 */
export interface ChartData {
  /** Category labels (for bar, pie, etc.) */
  labels?: string[];

  /** Data series to display */
  datasets: ChartDataset[];
}

/**
 * Chart Plugin Options
 * @description Configuration for chart plugins (legend, title, tooltip, etc.)
 */
export interface ChartPluginOptions {
  /** Legend configuration */
  legend?: {
    /** Whether to display legend */
    display?: boolean;
    /** Legend position */
    position?: string;
  };

  /** Title configuration */
  title?: {
    /** Whether to display title */
    display?: boolean;
    /** Title text */
    text?: string;
  };

  /** Tooltip configuration */
  tooltip?: {
    /** Whether tooltips are enabled */
    enabled?: boolean;
    /** Tooltip interaction mode */
    mode?: string;
  };

  /** Data labels configuration */
  datalabels?: {
    /** Whether to display data labels */
    display?: boolean;
    /** Label formatter function name */
    formatter?: string;
  };
}

/**
 * Chart Scale Options
 * @description Configuration for chart axes
 */
export interface ChartScaleOptions {
  /** X-axis configuration */
  x?: {
    /** Scale type (linear, category, time, etc.) */
    type?: string;
    /** Axis title configuration */
    title?: {
      display?: boolean;
      text?: string;
    };
    /** Whether to stack values on this axis */
    stacked?: boolean;
  };

  /** Y-axis configuration */
  y?: {
    /** Scale type (linear, logarithmic, etc.) */
    type?: string;
    /** Axis title configuration */
    title?: {
      display?: boolean;
      text?: string;
    };
    /** Whether to stack values on this axis */
    stacked?: boolean;
    /** Whether to start scale at zero */
    beginAtZero?: boolean;
  };
}

/**
 * Chart Interaction Options
 * @description Configuration for user interactions with the chart
 */
export interface ChartInteractionOptions {
  /** Interaction mode for hover/click events */
  mode?: 'point' | 'nearest' | 'index' | 'dataset' | 'x' | 'y';

  /** Whether to only trigger on direct element hit */
  intersect?: boolean;
}

/**
 * Chart Options
 * @description Complete configuration options for a chart
 */
export interface ChartOptions {
  /** Whether chart should resize with container */
  responsive?: boolean;

  /** Whether to maintain aspect ratio on resize */
  maintainAspectRatio?: boolean;

  /** Whether to animate chart rendering */
  animation?: boolean;

  /** Plugin configurations */
  plugins?: ChartPluginOptions;

  /** Axis/scale configurations */
  scales?: ChartScaleOptions;

  /** Interaction configurations */
  interaction?: ChartInteractionOptions;
}

/**
 * Chart Configuration
 * @description Complete chart definition including data and options
 */
export interface ChartConfig {
  /** Unique chart identifier */
  id: string;

  /** Chart visualization type */
  type: ChartType;

  /** Chart data */
  data: ChartData;

  /** Chart options */
  options?: ChartOptions;

  /** Display title */
  title?: string;

  /** Chart description */
  description?: string;
}

/**
 * Chart Render Result
 * @description Result of rendering a chart
 */
export interface ChartRenderResult {
  /** Identifier of the rendered chart */
  chartId: string;

  /** Chart configuration used */
  config: ChartConfig;

  /** URL to rendered image (for server-side rendering) */
  imageUrl?: string;

  /** Time taken to render in milliseconds */
  renderTime: number;
}
