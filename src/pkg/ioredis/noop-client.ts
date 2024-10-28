export class RedisNoopClient {
  private connected: boolean;
  public options: Record<string, unknown>;
  public status: string;

  constructor(options = {}) {
    this.connected = true;
    this.options = options;
    this.status = "ready";
  }

  // Connection methods
  connect() {
    return Promise.resolve();
  }

  disconnect() {
    this.connected = false;
    return Promise.resolve();
  }

  quit(): Promise<"OK"> {
    return this.disconnect().then(() => "OK");
  }

  // Basic operations
  get() {
    return Promise.resolve(null);
  }

  set(_key: string, _value: string | number | Buffer, ..._args: any[]): Promise<"OK"> {
    return Promise.resolve("OK");
  }

  del() {
    return Promise.resolve(1);
  }

  exists() {
    return Promise.resolve(0);
  }

  // List operations
  lpush() {
    return Promise.resolve(1);
  }

  rpush() {
    return Promise.resolve(1);
  }

  lpop() {
    return Promise.resolve(null);
  }

  rpop() {
    return Promise.resolve(null);
  }

  lrange() {
    return Promise.resolve([]);
  }

  // Hash operations
  hget() {
    return Promise.resolve(null);
  }

  hset() {
    return Promise.resolve(1);
  }

  hdel() {
    return Promise.resolve(1);
  }

  hgetall() {
    return Promise.resolve({});
  }

  // Set operations
  sadd() {
    return Promise.resolve(1);
  }

  srem() {
    return Promise.resolve(1);
  }

  smembers() {
    return Promise.resolve([]);
  }

  // Sorted Set operations
  zadd(): any {
    return Promise.resolve(1);
  }

  zrem() {
    return Promise.resolve(1);
  }

  zrange() {
    return Promise.resolve([]);
  }

  // Key operations
  expire() {
    return Promise.resolve(1);
  }

  ttl() {
    return Promise.resolve(-1);
  }

  // Pipeline
  pipeline(): any {
    return {
      exec: () => Promise.resolve([]),
      get: () => this,
      set: () => this,
      del: () => this,
      exists: () => this,
      lpush: () => this,
      rpush: () => this,
      lpop: () => this,
      rpop: () => this,
      hget: () => this,
      hset: () => this,
      hdel: () => this,
      sadd: () => this,
      srem: () => this,
      zadd: () => this,
      zrem: () => this,
    };
  }

  // Multi (Transaction)
  multi() {
    return this.pipeline();
  }

  // Pub/Sub
  publish() {
    return Promise.resolve(0);
  }

  subscribe() {
    return Promise.resolve();
  }

  unsubscribe() {
    return Promise.resolve();
  }

  // Connection status
  isConnected() {
    return this.connected;
  }
}
