---
title: "How to Deploy Redis with Docker"
description: "A practical guide to deploying Redis with Docker, Docker Compose, replication, Sentinel, and Redis Cluster."
pubDate: 2026-05-17
---

# How to Deploy Redis with Docker

In this article, I summarize several ways to deploy Redis with Docker, from a single standalone container to more advanced setups such as replication, Sentinel, and Redis Cluster.

All commands and configurations below are kept based on the setup you already tested successfully. I do not change the commands themselves. Instead, I add explanations so the article is easier to follow and easier to reuse in real projects.

## Which approach should you use?

- **Docker run**: good when you want to start Redis quickly for local testing.
- **Docker Compose standalone**: good when you want a cleaner and reusable setup.
- **Docker Compose with password**: good when you want to add a basic authentication layer.
- **Replication**: good when you want replicas for reading or for learning the primary-replica model.
- **Sentinel**: good when you want automatic failover for a master-replica setup.
- **Redis Cluster**: good when you need horizontal scaling and data sharding across multiple nodes.

## 1. Deploy Redis quickly with `docker run`

If you only need one Redis instance for learning, API testing, cache testing, or local development, this is the fastest way to start.

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine \
  redis-server --appendonly yes
```

### Quick explanation

- `-d`: runs the container in the background.
- `--name redis`: sets the container name to `redis`.
- `-p 6379:6379`: maps the default Redis port to the host machine.
- `-v redis_data:/data`: uses a Docker volume to persist data.
- `redis:7-alpine`: uses a lightweight Redis image.
- `redis-server --appendonly yes`: enables AOF persistence.

### Why use `--appendonly yes`?

By default, Redis is an in-memory data store. That means if the container or server stops unexpectedly, you may lose data that has not been written to disk yet. When `appendonly yes` is enabled, Redis writes every data-changing command such as `SET`, `DEL`, or `HSET` into an append-only file.

If you do not enable AOF, Redis can still persist data with RDB snapshots, but snapshots are created periodically. In a crash scenario, that means you may lose the most recent data written between the last snapshot and the failure.

## 2. Deploy Redis with Docker Compose

When you want a cleaner project structure, want to keep configuration in source control, and want to restart the service more easily, Docker Compose is a better choice than a single `docker run` command.

```yaml
version: '3.9'

services:
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

Start the stack:

```bash
docker compose up -d
```

### Quick test to verify Redis is ready

```bash
docker exec -it redis redis-cli
```

Inside Redis CLI:

```bash
PING
```

Expected result:

```bash
PONG
```

### When should you use this setup?

This setup is a good fit for:

- local development
- internal labs
- services that need basic data persistence
- small projects that do not need high availability yet

## 3. Docker Compose for Redis with a password

If you do not want Redis to be completely open, you can add a password with `--requirepass`.

```yaml
version: '3.9'

services:
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass myStrongPassword

volumes:
  redis_data:
```

Test the connection:

```bash
redis-cli -a myStrongPassword
```

### Note

This password is only a basic protection layer. In production, you should also combine it with:

- network isolation
- firewall or security group rules
- secret management
- TLS if Redis is accessed over an untrusted network

## 4. Docker Compose with Redis replication

Replication gives you one primary node and one or more replica nodes that synchronize data from the primary. This is a good step for understanding how Redis replication works and also a foundation before learning Sentinel or Cluster.

Topology:

```text
Master
 |- Replica 1
 `- Replica 2
```

This part requires a slightly more advanced setup.

### Create the project structure

```bash
mkdir redis-cluster-replica
cd redis-cluster-replica
mkdir conf
touch docker-compose.yml
touch conf/redis.conf
```

### `conf/redis.conf`

```conf
# Basic Redis configuration for cluster nodes

# The port number that Redis will listen on for client connections.
# This port is internal to the container and will be mapped to a distinct host port.
port 6379

# The cluster bus port is used for inter-node communication.
# It should always be 10000 + client_port.
cluster-announce-bus-port 16379

# Enable Redis Cluster mode. This is essential.
cluster-enabled yes

# Specifies the name of the file where the cluster configuration will be stored.
# This file is critical for node identity and cluster state.
# It's automatically rewritten by Redis.
cluster-config-file nodes.conf

# Timeout in milliseconds to detect a failure and promote a replica.
# A lower value means faster failover but might increase false positives in unstable networks.
cluster-node-timeout 5000

# By default, protected-mode is enabled. It prevents Redis from being accessed
# by clients other than those on the loopback interface.
# We disable it for ease of development/testing in Docker.
# For production, ensure proper network isolation and authentication.
protected-mode no

# Bind Redis to all network interfaces inside the container.
# This allows other containers in the same Docker network to connect.
bind 0.0.0.0

# Enable AOF (Append Only File) persistence.
# This ensures data is not lost on restart by logging every write operation.
appendonly yes

# Directory for persistence files (RDB snapshots and AOF).
# This will be mapped to a Docker volume.
dir /data
```

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Master Node 1
  redis-master-1:
    image: redis:7-alpine
    container_name: redis-master-1
    hostname: redis-master-1 # Set hostname for predictable internal DNS resolution
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip redis-master-1
    ports:
      - "6379:6379"  # Client port
      - "16379:16379" # Cluster bus port
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf # Mount our custom config
      - redis_data_master_1:/data # Persistent data volume
    networks:
      - redis_cluster_net
    # Healthcheck to ensure Redis is ready before proceeding (optional but good practice)
    healthcheck:
      test: ["CMD", "redis-cli", "-h", "localhost", "-p", "6379", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5


  # Replica Node 1
  redis-replica-1:
    image: redis:7-alpine
    container_name: redis-replica-1
    hostname: redis-replica-1
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip redis-replica-1
    ports:
      - "6382:6379"
      - "16382:16379"
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data_replica_1:/data
    networks:
      - redis_cluster_net
    healthcheck:
      test: ["CMD", "redis-cli", "-h", "localhost", "-p", "6379", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Replica Node 2
  redis-replica-2:
    image: redis:7-alpine
    container_name: redis-replica-2
    hostname: redis-replica-2
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip redis-replica-1
    ports:
      - "6383:6379"
      - "16383:16379"
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data_replica_2:/data
    networks:
      - redis_cluster_net
    healthcheck:
      test: ["CMD", "redis-cli", "-h", "localhost", "-p", "6379", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5


networks:
  redis_cluster_net:
    driver: bridge

volumes:
  redis_data_master_1:
  redis_data_replica_1:
  redis_data_replica_2:
```

### What does this setup give you?

- One main node for writes.
- Replica nodes for synchronization.
- A foundation you can later extend into a failover-capable setup.

This replication setup is good for labs and learning. If you need automatic failover, move to Sentinel. If you need data sharding across multiple nodes, move to Redis Cluster.

## 5. Docker Compose for Redis Sentinel

Sentinel is not used to shard data. Its job is to monitor the Redis master, detect failures, and elect a replica to become the new master when needed.

Topology:

```text
        Sentinel
       /   |   \
Sentinel Sentinel Sentinel

       Master
      /      \
 Replica1   Replica2
```

This setup is a bit more advanced.

### Create the project folder

```bash
mkdir redis-cluster-sentinel
cd redis-cluster-sentinel
touch docker-compose.yml
```

### `docker-compose.yml`

```yaml
version: '3.9'

services:

  redis-master:
    image: redis:7-alpine
    container_name: redis-master
    command: >
      redis-server
      --appendonly yes
      --requirepass redis123
    ports:
      - "6379:6379"
    volumes:
      - redis-master-data:/data
    networks:
      - redis-net

  redis-replica-1:
    image: redis:7-alpine
    container_name: redis-replica-1
    depends_on:
      - redis-master
    command: >
      redis-server
      --appendonly yes
      --replicaof redis-master 6379
      --masterauth redis123
      --requirepass redis123
    ports:
      - "6380:6379"
    volumes:
      - redis-replica-1-data:/data
    networks:
      - redis-net

  redis-replica-2:
    image: redis:7-alpine
    container_name: redis-replica-2
    depends_on:
      - redis-master
    command: >
      redis-server
      --appendonly yes
      --replicaof redis-master 6379
      --masterauth redis123
      --requirepass redis123
    ports:
      - "6381:6379"
    volumes:
      - redis-replica-2-data:/data
    networks:
      - redis-net

  redis-sentinel-1:
    image: redis:7-alpine
    container_name: redis-sentinel-1
    depends_on:
      - redis-master
    command: >
      sh -c "
      echo 'port 26379' > /etc/redis/sentinel.conf &&
      echo 'sentinel monitor mymaster redis-master 6379 2' >> /etc/redis/sentinel.conf &&
      echo 'sentinel auth-pass mymaster redis123' >> /etc/redis/sentinel.conf &&
      echo 'sentinel down-after-milliseconds mymaster 5000' >> /etc/redis/sentinel.conf &&
      echo 'sentinel failover-timeout mymaster 10000' >> /etc/redis/sentinel.conf &&
      echo 'sentinel parallel-syncs mymaster 1' >> /etc/redis/sentinel.conf &&
      redis-sentinel /etc/redis/sentinel.conf
      "
    ports:
      - "26379:26379"
    networks:
      - redis-net

  redis-sentinel-2:
    image: redis:7-alpine
    container_name: redis-sentinel-2
    depends_on:
      - redis-master
    command: >
      sh -c "
      echo 'port 26379' > /etc/redis/sentinel.conf &&
      echo 'sentinel monitor mymaster redis-master 6379 2' >> /etc/redis/sentinel.conf &&
      echo 'sentinel auth-pass mymaster redis123' >> /etc/redis/sentinel.conf &&
      echo 'sentinel down-after-milliseconds mymaster 5000' >> /etc/redis/sentinel.conf &&
      echo 'sentinel failover-timeout mymaster 10000' >> /etc/redis/sentinel.conf &&
      echo 'sentinel parallel-syncs mymaster 1' >> /etc/redis/sentinel.conf &&
      redis-sentinel /etc/redis/sentinel.conf
      "
    ports:
      - "26380:26379"
    networks:
      - redis-net

  redis-sentinel-3:
    image: redis:7-alpine
    container_name: redis-sentinel-3
    depends_on:
      - redis-master
    command: >
      sh -c "
      echo 'port 26379' > /etc/redis/sentinel.conf &&
      echo 'sentinel monitor mymaster redis-master 6379 2' >> /etc/redis/sentinel.conf &&
      echo 'sentinel auth-pass mymaster redis123' >> /etc/redis/sentinel.conf &&
      echo 'sentinel down-after-milliseconds mymaster 5000' >> /etc/redis/sentinel.conf &&
      echo 'sentinel failover-timeout mymaster 10000' >> /etc/redis/sentinel.conf &&
      echo 'sentinel parallel-syncs mymaster 1' >> /etc/redis/sentinel.conf &&
      redis-sentinel /etc/redis/sentinel.conf
      "
    ports:
      - "26381:26379"
    networks:
      - redis-net

networks:
  redis-net:

volumes:
  redis-master-data:
  redis-replica-1-data:
  redis-replica-2-data:
```

### Start the stack

```bash
docker compose up -d
```

### Check replication

Enter a replica:

```bash
docker exec -it redis-replica-1 redis-cli -a redis123
```

### Check Sentinel

```bash
docker exec -it redis-sentinel-1 redis-cli -p 26379
```

Get the current master:

```bash
SENTINEL get-master-addr-by-name mymaster
```

Example output:

```bash
1) "redis-master"
2) "6379"
```

### Test failover

Stop the master:

```bash
docker stop redis-master
```

Wait around 5 to 10 seconds.

Sentinel will:

- detect that the master is down
- promote one replica to become the new master

Check again:

```bash
docker exec -it redis-sentinel-1 redis-cli -p 26379
SENTINEL get-master-addr-by-name mymaster
```

You should see that the master has changed to a new replica.

### When should you use Sentinel?

Sentinel is a good choice when:

- you need high availability
- you do not need sharding yet
- you want Redis to fail over automatically
- your application still works with a single writable primary at a time

## 6. Docker Compose for Redis Cluster

Redis Cluster is different from Sentinel because it does not only handle failover. It also allows data to be distributed across multiple master nodes through hash slot sharding.

In short:

- **Sentinel**: mainly solves high availability
- **Cluster**: solves both high availability and horizontal scaling

This setup is more advanced.

### Create the project structure

```bash
mkdir redis-cluster
cd redis-cluster
mkdir conf
touch docker-compose.yml
touch conf/redis.conf
```

### `conf/redis.conf`

```conf
# Basic Redis configuration for cluster nodes

# The port number that Redis will listen on for client connections.
# This port is internal to the container and will be mapped to a distinct host port.
port 6379

# The cluster bus port is used for inter-node communication.
# It should always be 10000 + client_port.
cluster-announce-bus-port 16379

# Enable Redis Cluster mode. This is essential.
cluster-enabled yes

# Specifies the name of the file where the cluster configuration will be stored.
# This file is critical for node identity and cluster state.
# It's automatically rewritten by Redis.
cluster-config-file nodes.conf

# Timeout in milliseconds to detect a failure and promote a replica.
# A lower value means faster failover but might increase false positives in unstable networks.
cluster-node-timeout 5000

# By default, protected-mode is enabled. It prevents Redis from being accessed
# by clients other than those on the loopback interface.
# We disable it for ease of development/testing in Docker.
# For production, ensure proper network isolation and authentication.
protected-mode no

# Bind Redis to all network interfaces inside the container.
# This allows other containers in the same Docker network to connect.
bind 0.0.0.0

# Enable AOF (Append Only File) persistence.
# This ensures data is not lost on restart by logging every write operation.
appendonly yes

# Directory for persistence files (RDB snapshots and AOF).
# This will be mapped to a Docker volume.
dir /data
```

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Master Node 1
  redis-master-1:
    image: redis:7-alpine
    container_name: redis-master-1
    hostname: redis-master-1
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip redis-master-1
    ports:
      - "6379:6379"
      - "16379:16379"
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data_master_1:/data
    networks:
      - redis_cluster_net
    healthcheck:
      test: ["CMD", "redis-cli", "-h", "localhost", "-p", "6379", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Master Node 2
  redis-master-2:
    image: redis:7-alpine
    container_name: redis-master-2
    hostname: redis-master-2
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip redis-master-2
    ports:
      - "6380:6379"
      - "16380:16379"
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data_master_2:/data
    networks:
      - redis_cluster_net
    healthcheck:
      test: ["CMD", "redis-cli", "-h", "localhost", "-p", "6379", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Master Node 3
  redis-master-3:
    image: redis:7-alpine
    container_name: redis-master-3
    hostname: redis-master-3
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip redis-master-3
    ports:
      - "6381:6379"
      - "16381:16379"
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data_master_3:/data
    networks:
      - redis_cluster_net
    healthcheck:
      test: ["CMD", "redis-cli", "-h", "localhost", "-p", "6379", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Replica Node 1 (for Master 1)
  redis-replica-1:
    image: redis:7-alpine
    container_name: redis-replica-1
    hostname: redis-replica-1
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip redis-replica-1
    ports:
      - "6382:6379"
      - "16382:16379"
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data_replica_1:/data
    networks:
      - redis_cluster_net
    healthcheck:
      test: ["CMD", "redis-cli", "-h", "localhost", "-p", "6379", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Replica Node 2 (for Master 2)
  redis-replica-2:
    image: redis:7-alpine
    container_name: redis-replica-2
    hostname: redis-replica-2
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip redis-replica-2
    ports:
      - "6383:6379"
      - "16383:16379"
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data_replica_2:/data
    networks:
      - redis_cluster_net
    healthcheck:
      test: ["CMD", "redis-cli", "-h", "localhost", "-p", "6379", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Replica Node 3 (for Master 3)
  redis-replica-3:
    image: redis:7-alpine
    container_name: redis-replica-3
    hostname: redis-replica-3
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-announce-ip redis-replica-3
    ports:
      - "6384:6379"
      - "16384:16379"
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data_replica_3:/data
    networks:
      - redis_cluster_net
    healthcheck:
      test: ["CMD", "redis-cli", "-h", "localhost", "-p", "6379", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

networks:
  redis_cluster_net:
    driver: bridge

volumes:
  redis_data_master_1:
  redis_data_master_2:
  redis_data_master_3:
  redis_data_replica_1:
  redis_data_replica_2:
  redis_data_replica_3:
```

### Create the cluster

```bash
docker exec -it redis-master-1 redis-cli --cluster create \
  redis-master-1:6379 redis-master-2:6379 redis-master-3:6379 \
  redis-replica-1:6379 redis-replica-2:6379 redis-replica-3:6379 \
  --cluster-replicas 1
```

### Explanation

`--cluster-replicas 1` means each master will have one replica, so in total you will have 3 master nodes and 3 replica nodes.

Redis will ask:

```bash
Can I set the above configuration? (type 'yes' to accept):
```

Type:

```bash
yes
```

### Verify the cluster

```bash
docker exec -it redis-node-1 redis-cli -p 7001 cluster nodes
```

Or:

```bash
docker exec -it redis-node-1 redis-cli -p 7001 cluster info
```

### When should you use Redis Cluster?

Redis Cluster is a good fit when:

- your dataset is larger than a single node can handle
- you need horizontal scaling
- you want to distribute reads and writes across shards
- you need failover at the cluster level

## What is the difference between Sentinel and Cluster?

Many people who are new to Redis confuse these two concepts:

- **Redis Sentinel** does not shard data. It monitors a master-replica group, detects failures, and performs automatic failover.
- **Redis Cluster** shards data across multiple master nodes and still uses replicas for failover.

If your problem is "I have one main Redis instance, I need replicas, and I want automatic failover if the master fails", Sentinel is enough.

If your problem is "my workload and dataset are growing, and I need to distribute data across multiple nodes", Redis Cluster is the better choice.

## Conclusion

If you want to deploy Redis quickly, start with `docker run` or a simple Docker Compose file. When you need basic protection, add a password. When you need synchronized copies of data, use replication. When you need high availability, use Sentinel. When you need horizontal scaling and data sharding, use Redis Cluster.

This article should give you a practical reference you can copy, test, and extend for your own Redis deployments.
