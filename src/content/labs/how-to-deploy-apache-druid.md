---
title: "How to Deploy Apache Druid with Docker"
description: "A practical lab guide to building and deploying Apache Druid using Docker to understand its core components."
pubDate: 2026-03-29
heroImage: /build-druid.png
---

In this lab, I will guide you through deploying Apache Druid using Docker. This approach provides a practical way to visualize and understand the various components of a Druid cluster.

## 1. Ways to Deploy Apache Druid

To deploy Apache Druid, we generally have a few options:

- **Docker:** The easiest and fastest way to get started.
- **Manual Installation:** Offers high performance, suitable for bare-metal servers or VMs.
- **Kubernetes (K8s):** Ideal for large-scale systems and eliminates the dependency on ZooKeeper in modern architectures.

In this lab, we will deploy Druid using **Docker** to keep things as simple as possible while allowing us to visualize all of Druid's internal components.

*(If you are interested in deploying Druid on Kubernetes for production, you can refer to the official Apache Druid documentation: [Kubernetes Operations](https://druid.apache.org/docs/latest/operations/kubernetes))*

## 2. Environment Preparation

Before we begin, ensure your system has the following installed:
- **Docker** and Docker Compose
- **Git**

## 3. Deployment Steps

Deploying Druid this way is quite simple. We will clone the official repository and build the Docker image from source.

```bash
git clone https://github.com/apache/druid.git
```

*Note: You can switch to a specific branch or tag if needed.*
- *Switch to a branch: `git switch <branch-name>`*
- *Switch to a tag: `git switch --detach <tag-name>`*
*(Using `git switch` instead of `checkout` helps avoid confusion).*

Next, navigate into the cloned repository:

```bash
cd druid/
```

From here, we have two choices for deploying with Docker Compose:
1.  **Deploy directly using pre-packaged images:** This requires checking if the images defined in `docker-compose.yml` already exist on Docker Hub.
2.  **Build the image yourself:** This is **highly recommended**. Building from source allows you to customize many things, such as loaded extensions, behaviors, JVM memory settings (`Xmx`, `Xms`), and more.

For this article, we will use the **self-build** method.

```bash
DOCKER_BUILDKIT=1 docker build -t apache/druid:my-tag -f distribution/docker/Dockerfile .
```

*I am using `my-tag` as the image tag here.*

!Build Druid

After the build is complete, we need to modify the `distribution/docker/docker-compose.yml` file. Update the following details:
- **Change the image tag:** Replace `image: apache/druid:37.0.0` (or whatever the default version is) with `image: apache/druid:my-tag`.
- **Update PostgreSQL variables:** If you change the database credentials here, make sure you also update the `distribution/docker/environment` file to match.

*Optional: If you do not want to use PostgreSQL for metadata storage, you can also build the image with MySQL support like this:*
```bash
docker build -t apache/druid:tag-mysql --build-arg DRUID_RELEASE=apache/druid:tag -f distribution/docker/Dockerfile.mysql .
```

Once you have finished modifying the configuration, start the cluster:

```bash
docker compose -f distribution/docker/docker-compose.yml up -d
```

!Docker Compose Up Druid

When the deployment is complete, you can access the Apache Druid web console by navigating to:
`http://<your_ip_address>:8888/`

!Apache Druid Dashboard

From the dashboard, you can check the status of the various services running in your cluster:

!Apache Druid Services

### Key UI Components Overview

- **Load data:** The interface to configure where Druid ingests data from, how to parse it, and how it should be stored.
- **Datasources:** Displays the databases/tables that have been queried and stored.
- **Supervisor:** The place where Druid monitors the actively running ingestion tasks (Peons).
- **Tasks:** Displays the results and status of the tasks executed by the Peons.
- **Segments:** Contains information and metadata about the data segments.

### The `environment` Configuration File

There is one extremely important file you should be aware of: `distribution/docker/environment`. 
This file contains crucial configurations for Druid, including JVM tuning (`Xmx`, `Xms`), loaded extensions, and database connections. 

Let's take a look at its contents:

```bash
cat distribution/docker/environment
```

```properties
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#

# Java tuning
#DRUID_XMX=1g
#DRUID_XMS=1g
#DRUID_MAXNEWSIZE=250m
#DRUID_NEWSIZE=250m
#DRUID_MAXDIRECTMEMORYSIZE=6172m
DRUID_SINGLE_NODE_CONF=micro-quickstart

druid_emitter_logging_logLevel=debug

druid_extensions_loadList=["druid-histogram", "druid-datasketches", "druid-lookups-cached-global", "postgresql-metadata-storage"]

druid_zk_service_host=zookeeper

druid_metadata_storage_host=
druid_metadata_storage_type=postgresql
druid_metadata_storage_connector_connectURI=jdbc:postgresql://postgres:5432/druid
druid_metadata_storage_connector_user=druid
druid_metadata_storage_connector_password=FoolishPassword

druid_indexer_runner_javaOptsArray=["-server", "-Xmx1g", "-Xms1g", "-XX:MaxDirectMemorySize=3g", "-Duser.timezone=UTC", "-Dfile.encoding=UTF-8", "-Djava.util.logging.manager=org.apache.logging.log4j.jul.LogManager"]
druid_indexer_fork_property_druid_processing_buffer_sizeBytes=256MiB

druid_storage_type=local
druid_storage_storageDirectory=/opt/shared/segments
druid_indexer_logs_type=file
druid_indexer_logs_directory=/opt/shared/indexing-logs

druid_processing_numThreads=2
druid_processing_numMergeBuffers=2

DRUID_LOG4J=<?xml version="1.0" encoding="UTF-8" ?><Configuration status="WARN"><Appenders><Console name="Console" target="SYSTEM_OUT"><PatternLayout pattern="%d{ISO8601} %p [%t] %c - %m%n"/></Console></Appenders><Loggers><Root level="info"><AppenderRef ref="Console"/></Root><Logger name="org.apache.druid.jetty.RequestLog" additivity="false" level="DEBUG"><AppenderRef ref="Console"/></Logger></Loggers></Configuration>
```

## 4. Conclusion

Through this lab, you have deployed Apache Druid locally using Docker and interacted with its core components. This provides a solid, hands-on overview of how the system operates and how its decoupled architecture can scale to deliver massive OLAP performance and real-time data querying.

I hope this article helps you get up and running with Apache Druid effortlessly!