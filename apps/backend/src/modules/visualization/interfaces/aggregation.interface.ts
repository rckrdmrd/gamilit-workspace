/**
 * Aggregation Interfaces
 *
 * @description Interfaces for data aggregation, time series, and metric calculations.
 * Supports various aggregation operations for educational analytics.
 *
 * @module visualization/interfaces
 * @version 1.0.0
 * @since Sprint 4 - EXT-005 Visualizations
 */

/**
 * Aggregation Types
 * @description Statistical aggregation operations
 */
export enum AggregationType {
  /** Sum of values */
  SUM = 'sum',

  /** Average (mean) of values */
  AVG = 'avg',

  /** Count of records */
  COUNT = 'count',

  /** Minimum value */
  MIN = 'min',

  /** Maximum value */
  MAX = 'max',

  /** Median value (50th percentile) */
  MEDIAN = 'median',

  /** Specific percentile value */
  PERCENTILE = 'percentile',

  /** Standard deviation */
  STDDEV = 'stddev',

  /** Variance */
  VARIANCE = 'variance',
}

/**
 * Time Granularity
 * @description Time bucket sizes for time-series aggregation
 */
export enum TimeGranularity {
  /** Hourly buckets */
  HOUR = 'hour',

  /** Daily buckets */
  DAY = 'day',

  /** Weekly buckets */
  WEEK = 'week',

  /** Monthly buckets */
  MONTH = 'month',

  /** Quarterly buckets */
  QUARTER = 'quarter',

  /** Yearly buckets */
  YEAR = 'year',
}

/**
 * Aggregation Filter
 * @description Filter condition for aggregation queries
 */
export interface AggregationFilter {
  /** Field to filter */
  field: string;

  /** Filter operator */
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'nin'
    | 'between'
    | 'isNull'
    | 'isNotNull';

  /** Filter value(s) */
  value: unknown;
}

/**
 * Aggregation Order By
 * @description Sorting configuration for aggregation results
 */
export interface AggregationOrderBy {
  /** Field to sort by */
  field: string;

  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Aggregation Query
 * @description Query definition for data aggregation
 */
export interface AggregationQuery {
  /** Metric/field to aggregate */
  metric: string;

  /** Aggregation operation to perform */
  aggregation: AggregationType;

  /** Fields to group by */
  groupBy?: string[];

  /** Time granularity for time-series */
  timeGranularity?: TimeGranularity;

  /** Filter conditions */
  filters?: AggregationFilter[];

  /** Result ordering */
  orderBy?: AggregationOrderBy;

  /** Maximum number of results */
  limit?: number;

  /** Percentile value (0-100) for PERCENTILE aggregation */
  percentileValue?: number;
}

/**
 * Aggregation Data Point
 * @description Single result point from an aggregation query
 */
export interface AggregationDataPoint {
  /** Dimension values (from groupBy) */
  dimensions: Record<string, unknown>;

  /** Aggregated value */
  value: number;

  /** Time bucket (if using time granularity) */
  timeBucket?: Date;
}

/**
 * Aggregation Metadata
 * @description Metadata about an aggregation result
 */
export interface AggregationMetadata {
  /** Total records processed */
  totalRecords: number;

  /** Query execution time in milliseconds */
  queryTime: number;

  /** Whether result came from cache */
  cacheHit: boolean;

  /** Data date range (if applicable) */
  dataRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Aggregation Result
 * @description Complete result from an aggregation query
 */
export interface AggregationResult {
  /** Original query */
  query: AggregationQuery;

  /** Result data points */
  data: AggregationDataPoint[];

  /** Result metadata */
  metadata: AggregationMetadata;
}

/**
 * Time Series Point
 * @description Single point in a time series
 */
export interface TimeSeriesPoint {
  /** Point timestamp */
  timestamp: Date;

  /** Point value */
  value: number;

  /** Optional dimension values */
  dimensions?: Record<string, unknown>;
}

/**
 * Time Series Data
 * @description Complete time series dataset
 */
export interface TimeSeriesData {
  /** Series data points */
  series: TimeSeriesPoint[];

  /** Time bucket granularity */
  granularity: TimeGranularity;

  /** Series start date */
  startDate: Date;

  /** Series end date */
  endDate: Date;

  /** Whether to fill gaps with zero/null */
  fillGaps?: boolean;
}

/**
 * Comparative Metric
 * @description Metric with period-over-period comparison
 */
export interface ComparativeMetric {
  /** Current period value */
  current: number;

  /** Previous period value */
  previous: number;

  /** Absolute change (current - previous) */
  change: number;

  /** Percentage change */
  changePercent: number;

  /** Trend direction */
  trend: 'up' | 'down' | 'stable';
}
