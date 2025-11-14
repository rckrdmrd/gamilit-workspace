# Cache Configuration for Student Insights

## Overview

The Analytics Service uses caching to improve performance when generating student insights. By default, it uses in-memory caching provided by NestJS `@nestjs/cache-manager`. For production, it's recommended to use Redis.

## Current Configuration

- **Provider**: In-memory (cache-manager)
- **TTL**: 5 minutes (300 seconds)
- **Cache Key Pattern**: `student-insights:{studentId}`
- **Invalidation**: Manual (on data changes)

## Cache Behavior

### When Cache is Used
- Student insights are cached for 5 minutes after first generation
- Subsequent requests for the same student within TTL return cached data
- Improves response time from ~500ms to <10ms

### Cache Invalidation
The cache is automatically invalidated when:
- Manual invalidation via `invalidateStudentInsightsCache(studentId)`
- TTL expires (5 minutes)

**Note**: Cache should be invalidated manually when:
- Student completes an exercise
- Student earns an achievement
- Teacher updates student notes
- Student progress changes significantly

## Migration to Redis (Production)

### 1. Install Redis Dependencies

```bash
npm install redis@^4.0.0
```

### 2. Update app.module.ts

```typescript
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      ttl: 300, // 5 minutes default
    }),
    // ... other imports
  ],
})
export class AppModule {}
```

### 3. Environment Variables

Add to `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TLS=false
```

For production (AWS ElastiCache, etc.):

```env
REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
REDIS_TLS=true
```

### 4. Update InvalidateAll Method

Once Redis is configured, update `invalidateAllStudentInsightsCache()`:

```typescript
async invalidateAllStudentInsightsCache(): Promise<void> {
  try {
    const redis = this.cacheManager.store;
    const keys = await redis.keys(`${this.INSIGHTS_CACHE_PREFIX}*`);

    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
      this.logger.log(`Invalidated ${keys.length} student insights cache entries`);
    }
  } catch (error) {
    this.logger.warn(`Error invalidating all insights cache: ${error.message}`);
  }
}
```

## Cache Metrics & Monitoring

### Recommended Metrics to Track

1. **Cache Hit Rate**: `(cache_hits / total_requests) * 100`
2. **Cache Miss Rate**: `(cache_misses / total_requests) * 100`
3. **Average Response Time**: With cache vs without cache
4. **Cache Size**: Number of cached insights
5. **Invalidation Frequency**: How often cache is invalidated

### Logging

The service logs cache operations at DEBUG level:
- `Cache HIT for student insights: {studentId}`
- `Cache MISS for student insights: {studentId}`
- `Cached student insights for {studentId} (TTL: 300s)`
- `Invalidated cache for student insights: {studentId}`

Enable debug logs:
```typescript
// main.ts or logger config
app.useLogger(['log', 'error', 'warn', 'debug']);
```

## Performance Benchmarks

### Expected Performance

| Scenario | Without Cache | With Cache | Improvement |
|----------|--------------|------------|-------------|
| First Request | 450-600ms | 450-600ms | 0% (cache miss) |
| Subsequent Requests | 450-600ms | 5-15ms | ~95% |
| High Load (100 req/s) | ~45-60s total | ~0.5-1.5s total | ~95% |

### Cache Hit Rate Targets

- **Development**: 50-60% (frequent invalidations during testing)
- **Production**: 80-90% (stable data, 5min TTL is effective)

## Cache Warming Strategy (Optional)

For high-traffic production environments, consider pre-warming cache:

```typescript
// In a scheduled job (e.g., every 4 minutes)
@Cron('0 */4 * * * *')
async warmStudentInsightsCache() {
  const activeStudents = await this.getActiveStudents();

  await Promise.all(
    activeStudents.map(student =>
      this.analyticsService.getStudentInsights(student.id)
    )
  );

  this.logger.log(`Warmed cache for ${activeStudents.length} students`);
}
```

## Troubleshooting

### Cache Not Working
1. Verify CacheModule is imported in teacher.module.ts
2. Check CACHE_MANAGER injection in analytics.service.ts
3. Review logs for cache errors

### High Memory Usage (In-Memory Cache)
- Switch to Redis for production
- Reduce TTL if needed
- Implement cache size limits

### Stale Data Issues
- Reduce TTL (current: 5 minutes)
- Implement event-based invalidation
- Add manual refresh endpoint

## API Endpoints for Cache Management

Consider adding these endpoints for cache management:

```typescript
// In teacher.controller.ts
@Delete('students/:id/insights/cache')
async invalidateStudentCache(@Param('id') studentId: string) {
  await this.analyticsService.invalidateStudentInsightsCache(studentId);
  return { message: 'Cache invalidated successfully' };
}

@Delete('insights/cache')
@Roles(GamilityRoleEnum.SUPER_ADMIN)
async invalidateAllCache() {
  await this.analyticsService.invalidateAllStudentInsightsCache();
  return { message: 'All insights cache invalidated' };
}
```

## Best Practices

1. **Always invalidate cache on data changes** that affect insights
2. **Monitor cache hit rates** to ensure effectiveness
3. **Use Redis in production** for better performance and scalability
4. **Set appropriate TTL** based on data freshness requirements
5. **Implement graceful degradation** if cache fails (continue without cache)
6. **Log cache operations** for debugging and monitoring

## Related Files

- Service: `src/modules/teacher/services/analytics.service.ts`
- Module: `src/modules/teacher/teacher.module.ts`
- Tests: `src/modules/teacher/__tests__/analytics.service.spec.ts`
