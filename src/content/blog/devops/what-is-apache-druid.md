---
title: "What is Apache Druid and its Applications in Production"
description: "An introduction to Apache Druid, a high-performance real-time analytics database."
pubDate: "March 28 2026"
heroImage: "/Apache_Druid_logo.svg.png"
---

In this article, I will introduce and provide an overview of Apache Druid, giving you a comprehensive look at how it works and evaluating the benefits it can bring to your data jobs.

## 1. Introduction

![Apache Druid Logo](/ApacheDruidLogo.png)

Created in 2011 and later moved to an Apache License in February 2015, Apache Druid is written in Java. Druid is a high-performance, real-time analytical data store for event-driven data. It operates as a distributed system with several components designed for fast slice-and-dice analytics on large datasets (OLAP). Druid is most often used as a database for real-time use cases requiring blazing-fast query speeds.

Its storage and query engines are entirely timestamp-based, making it highly suitable for time-series queries. Furthermore, it can scale horizontally with ease.

Common use cases for Druid include:
- Clickstream analytics (web and mobile analytics)
- Network telemetry analytics (network performance monitoring)
- Server metrics storage
- Supply chain analytics (manufacturing metrics)
- Application performance metrics
- Digital marketing/advertising analytics
- Business intelligence / OLAP

## 2. Architecture Diagram

![Apache Druid Architecture](/druid-architecture.svg)

Druid operates with several distinct types of services:
*   **Coordinator:** Manages data availability on the cluster.
*   **Overlord:** Controls the assignment of data ingestion tasks.
*   **Broker:** Handles queries from external clients.
*   **Router:** Routes requests to Brokers, Coordinators, or Overlords.
*   **Historical:** Stores ingested data and serves queries.
*   **Middle Manager & Peon:** Executes the data ingestion processes.
*   **Indexer:** An alternative to the Middle Manager + Peon task execution system.

You can view these services in the *Services* tab of the web console:
![Druid Services Overview](/druid-services-overview.png)

### 2.1. Coordinator
**Role:** Manages data availability in the cluster.

The Coordinator is responsible for:
- Monitoring Historical nodes.
- Deciding which segments should be loaded onto which Historical nodes.
- Balancing data across Historical nodes.
- Dropping expired segments based on retention policies.

*Analogy:* The Coordinator acts like a "warehouse manager", deciding exactly where data should be placed.

### 2.2. Overlord
**Role:** Manages ingestion tasks.

Examples include:
- Reading data from Kafka.
- Running batch ingestion from S3 or HDFS.
- Starting and monitoring ingestion tasks.

When you submit an ingestion spec (e.g., `POST /druid/indexer/v1/task`), the Overlord is the service that receives and manages that task.

*Analogy:* The Overlord acts as the "scheduler" of Druid.

### 2.3. Broker
**Role:** Processes queries.

For example, when Apache Superset sends a query:
```sql
SELECT COUNT(*) FROM users
```
The flow is:
1. The Broker receives the query.
2. The Broker determines which Historical nodes hold the relevant data.
3. The Broker routes the query to those Historicals.
4. The Broker aggregates the results.
5. The Broker returns the final result to Superset.

*Analogy:* The Broker acts as an API Gateway for queries.

### 2.4. Router
**Role:** Unified entry point for Druid.

Instead of routing traffic separately:
- Superset -> Broker
- Admin -> Coordinator
- Developer -> Overlord

You can route everything through the Router:
```text
Superset / Admin / Developer
           |
         Router
           |
  --------------------
  |        |         |
Broker Coordinator Overlord
```
The Router will automatically forward the request to the correct service.

### 2.5. Historical
**Role:** Stores data and serves queries.

Historical nodes contain:
- Completed data segments.
- Data files stored on local disks downloaded from deep storage.

When a Broker needs data, it reaches out to the Historical node, which then reads the segment and returns the result. Large clusters typically run many Historical nodes.

### 2.6. Middle Manager
**Role:** Runs ingestion tasks.

```text
      Kafka
        |
  Middle Manager
        |
  Druid Segment
```
The Middle Manager receives tasks from the Overlord and executes them.

### 2.7. Peon
**Role:** The actual worker process.

Each ingestion task usually runs in its own isolated Peon process.
```text
      Overlord
         |
   Middle Manager
         |
  -----------------
  |       |       |
Peon1   Peon2   Peon3
```
- Peon1 reads from Kafka Topic A.
- Peon2 reads from Kafka Topic B.
- Peon3 runs a batch ingestion task.

### 2.8. Indexer
**Role:** Replacement for Middle Manager + Peon.

In newer versions of Druid, many architectures use the Indexer instead.
**Advantages:**
- Fewer processes.
- Easier to manage on Kubernetes.
- Saves system resources.

*Old Architecture:* Overlord -> Middle Manager -> Peon
*New Architecture:* Overlord -> Indexer

> **Note:** If you are deploying Druid, the three services that most directly impact performance are the **Broker** (processing queries), **Historical** (reading data), and **Middle Manager / Indexer** (ingesting data).

## 3. How Apache Druid Stores Data

Druid data is stored in "datasources", which are analogous to tables in a relational database. Each datasource is partitioned by time (mostly) or by other attributes into "chunks". 

Within each chunk, data is further divided into one or more "segments". Each segment is an append-only data file containing up to a few million rows (depending on configuration) known as a segment file.

See the image below for a better visual representation:
!Druid Timeline Segment

Because of this time-based chunking and segmenting, Druid is exceptionally well-suited for storing logs, events, and other time-series data where timestamps are critical for real-time querying.

## 4. Data Ingestion Workflow

1. **Create Ingestion Spec:** A JSON file (handwritten or generated via the UI) describing the ingestion method (stream/batch), data source, ETL logic, `__time` column definitions, etc.
2. **Submit Task to Overlord:** The spec is submitted via `POST` directly to the Overlord or through the Router. The Overlord validates it, generates a Task ID, and stores the metadata in the database (e.g., PostgreSQL or MySQL).
3. **Overlord Assigns the Task:** It finds a Middle Manager with available computing resources and assigns the task to it.
4. **Middle Manager Creates a Peon:** The Middle Manager spawns a new JVM process (Peon). You can verify this in the terminal using `ps aux | grep peon`.
5. **Peon Processes Data:** Based on the spec, the Peon connects to the data source, processes the stream or batch, parses the data, creates segments, and periodically persists them to disk.
6. **Push Segment:** After the segment is uploaded to Deep Storage, the Peon writes the segment metadata to Druid's metadata database.
7. **Coordinator Polling:** The Coordinator continuously polls the metadata DB. Upon detecting a new segment, it decides which Historical node should load it.
8. **Historical Loads Segment:** The Historical node downloads the segment from deep storage to its local disk and notifies the cluster that the "Segment is Available."

## 5. Data Query Workflow

1. **API Client Sends Query:** An admin or client sends a query to the Broker or Router via API.
   *Example:* `SELECT COUNT(*) AS count_num FROM user_events WHERE __time >= CURRENT_TIMESTAMP - INTERVAL '7' DAY`
2. **Broker Analyzes Query:** The Broker parses the SQL, translates it into Druid's native query format, identifies the targeted datasource, time range, and relevant segments by looking up the cluster metadata cache.
3. **Broker Locates Historicals:** It determines which Historical nodes are currently hosting the relevant segments.
4. **Scatter Queries:** The Broker splits the query into sub-queries and scatters them to the respective Historical nodes.
5. **Historical Scans Segments:** The Historical reads the segments already loaded on its local disk. 
   *(Note: Historicals DO NOT read directly from S3, HDFS, or PostgreSQL; segments are pre-loaded).*
6. **Filtering:** Using the `WHERE` clause, the Historical filters the data using highly optimized bitmap indexes and dictionary encoding. This allows it to achieve high performance without doing a full table scan like traditional row-store databases.
7. **Aggregation:** The Historical locally computes the aggregation (e.g., `COUNT(*)`).
8. **Return Partial Results:** Each Historical node returns its partially aggregated results back to the Broker.
9. **Broker Merges Results:** The Broker merges the partial results from all Historicals and returns the final result to the API client.
```text
Hist1 ----\
Hist2 ----- > Broker
Hist3 ----/
```
> **Streaming Exception:** For newly ingested streaming data that hasn't yet been published as a segment to a Historical node, the Peon's "Realtime Task" handles it. If a query requires fresh data, the Broker will simultaneously query both the Historical nodes and the Realtime Tasks, then merge the results. This is how Druid guarantees near real-time query capabilities.

## 6. Conclusion

Apache Druid's architecture isn't exactly lightweight due to its multiple specialized components. However, this decoupling is precisely what allows Druid to scale horizontally with zero downtime—simply by adding more nodes (MiddleManagers, Historicals, etc.). Furthermore, it delivers incredibly high efficiency for processing both real-time streams and historical batch data.

I hope this introduction helps you understand Apache Druid better. Grasping its architecture and internal workflows is the key to knowing exactly what it's used for and applying it optimally to your data engineering jobs!