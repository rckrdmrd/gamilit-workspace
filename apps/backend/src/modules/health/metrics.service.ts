/**
 * MetricsService
 *
 * Application-level Prometheus metrics for monitoring and alerting.
 * Exposes counters, histograms, and gauges for key business and infrastructure metrics.
 *
 * @ref ESTANDAR-OBSERVABILIDAD §3
 * @ref GUIA-OPENTELEMETRY-NESTJS §5
 */

import { Injectable } from '@nestjs/common';

interface MetricEntry {
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

@Injectable()
export class MetricsService {
  // Counters
  private readonly counters = new Map<string, MetricEntry[]>();

  // Histograms (store individual observations)
  private readonly histograms = new Map<string, MetricEntry[]>();

  // Gauges
  private readonly gauges = new Map<string, MetricEntry>();

  constructor() {
    // Initialize standard metrics
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    // Pre-initialize gauges with defaults
    this.setGauge('active_websocket_connections', 0);
    this.setGauge('active_sessions', 0);
  }

  // === Counters ===

  incrementCounter(name: string, labels: Record<string, string> = {}, value = 1): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, []);
    }
    this.counters.get(name)!.push({ value, labels, timestamp: Date.now() });
  }

  // === Histograms ===

  observeHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }
    this.histograms.get(name)!.push({ value, labels, timestamp: Date.now() });
  }

  // === Gauges ===

  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    this.gauges.set(name, { value, labels, timestamp: Date.now() });
  }

  // === Convenience methods for common metrics ===

  recordHttpRequest(method: string, route: string, statusCode: number, durationMs: number): void {
    const labels = { method, route, status_code: String(statusCode) };
    this.incrementCounter('http_requests_total', labels);
    this.observeHistogram('http_request_duration_seconds', durationMs / 1000, labels);
  }

  recordAuthLogin(success: boolean): void {
    this.incrementCounter('auth_login_total', { success: String(success) });
  }

  recordExerciseSubmission(moduleId: string, exerciseType: string): void {
    this.incrementCounter('exercise_submissions_total', { module_id: moduleId, exercise_type: exerciseType });
  }

  recordDbQuery(durationMs: number, operation: string): void {
    this.observeHistogram('db_query_duration_seconds', durationMs / 1000, { operation });
  }

  setActiveWebSocketConnections(count: number): void {
    this.setGauge('active_websocket_connections', count);
  }

  setActiveSessions(count: number): void {
    this.setGauge('active_sessions', count);
  }

  // === Prometheus text format export ===

  getPrometheusMetrics(): string {
    const lines: string[] = [];

    // Export counters
    for (const [name, entries] of this.counters) {
      lines.push(`# HELP ${name} Counter metric`);
      lines.push(`# TYPE ${name} counter`);
      const aggregated = this.aggregateCounter(entries);
      for (const { labels, value } of aggregated) {
        const labelStr = this.formatLabels(labels);
        lines.push(`${name}${labelStr} ${value}`);
      }
    }

    // Export histograms as summaries (simplified — full histogram requires bucket configs)
    for (const [name, entries] of this.histograms) {
      if (entries.length === 0) continue;
      lines.push(`# HELP ${name} Histogram metric`);
      lines.push(`# TYPE ${name} summary`);
      const grouped = this.groupByLabels(entries);
      for (const { labels, values } of grouped) {
        const labelStr = this.formatLabels(labels);
        const sum = values.reduce((a, b) => a + b, 0);
        const count = values.length;
        lines.push(`${name}_sum${labelStr} ${sum.toFixed(6)}`);
        lines.push(`${name}_count${labelStr} ${count}`);
      }
    }

    // Export gauges
    for (const [name, entry] of this.gauges) {
      lines.push(`# HELP ${name} Gauge metric`);
      lines.push(`# TYPE ${name} gauge`);
      const labelStr = this.formatLabels(entry.labels);
      lines.push(`${name}${labelStr} ${entry.value}`);
    }

    return lines.join('\n') + '\n';
  }

  private formatLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    const pairs = entries.map(([k, v]) => `${k}="${v}"`).join(',');
    return `{${pairs}}`;
  }

  private aggregateCounter(entries: MetricEntry[]): { labels: Record<string, string>; value: number }[] {
    const map = new Map<string, { labels: Record<string, string>; value: number }>();
    for (const entry of entries) {
      const key = JSON.stringify(entry.labels);
      const existing = map.get(key);
      if (existing) {
        existing.value += entry.value;
      } else {
        map.set(key, { labels: { ...entry.labels }, value: entry.value });
      }
    }
    return Array.from(map.values());
  }

  private groupByLabels(entries: MetricEntry[]): { labels: Record<string, string>; values: number[] }[] {
    const map = new Map<string, { labels: Record<string, string>; values: number[] }>();
    for (const entry of entries) {
      const key = JSON.stringify(entry.labels);
      const existing = map.get(key);
      if (existing) {
        existing.values.push(entry.value);
      } else {
        map.set(key, { labels: { ...entry.labels }, values: [entry.value] });
      }
    }
    return Array.from(map.values());
  }
}
