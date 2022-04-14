import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  get(key) {
    return this.cache.get(JSON.stringify(key));
  }

  async set(key, value) {
    await this.cache.set(JSON.stringify(key), JSON.stringify(value));
  }

  async del(key: string) {
    await this.cache.del(JSON.stringify(key));
  }
}
