---
title: "How to Deploy Apache Druid with Docker"
description: "A step-by-step lab guide on how to build and deploy Apache Druid using Docker."
pubDate: 2026-03-30
heroImage: "/apache-druid-dashboard.png"
tags: ["druid", "docker", "devops", "lab"]
---

# How to Deploy Apache Druid with Docker

## 1. Ways to Deploy Apache Druid

To deploy Apache Druid, we can choose from the following methods:
- **Docker:** The simplest method.
- **Manual Installation:** Offers high performance.
- **Kubernetes (K8s):** Suitable for large systems and removes the dependency on ZooKeeper.

In this lab, we will deploy Druid using Docker. This is the simplest way to visualize and understand the components within Druid. 
If you are interested in deploying Druid on Kubernetes, you can refer to the official Apache Druid documentation: [https://druid.apache.org/docs/latest/operations/kubernetes](https://druid.apache.org/docs/latest/operations/kubernetes).

## 2. Environment Preparation

- Install Docker
- Install Git

## 3. Deployment Steps

Deploying Druid is quite straightforward. You just need to clone the repository and build it.

```bash
git clone https://github.com/apache/druid.git
# You can switch to another branch or tag
# Switch branch -> git switch <branch_name>
# Switch tag -> git switch --detach <tag_name>
# Use git switch instead of checkout to avoid confusion
```

Next, navigate into the cloned repository:

```bash
cd druid/
```

From here, we have two options:
- **Deploy directly using pre-packaged images:** This method requires checking if these images already exist on Docker Hub. You can do this by checking the image names in the `docker-compose.yml` file and searching for them on Docker Hub.
- **Build it yourself:** This is highly recommended because it allows you to customize many things, such as extensions, behaviors, XMX size, XMS size, etc.

For this article, we will use the self-build method.

```bash
DOCKER_BUILDKIT=1 docker build -t apache/druid:<your_tag> -f distribution/docker/Dockerfile .
```

I will use `my-tag` as the tag for this example.

![Build Druid](/build-druid.png)

After the build is complete, we need to modify the `distribution/docker/docker-compose.yml` file. Make the following changes:
- Change the image from `apache/druid:37.0.0` (or the current default) to `image: apache/druid:my-tag`.
- Update the PostgreSQL variables. Note that if you modify them here, you must also update the `distribution/docker/environment` file accordingly to ensure they match.

If you do not want to use PostgreSQL, you can also build the image with other databases, such as MySQL:

```bash
docker build -t apache/druid:tag-mysql --build-arg DRUID_RELEASE=apache/druid:tag -f distribution/docker/Dockerfile.mysql .
```

Once the modifications are done, you can run the following command to start the cluster:

```bash
docker compose -f distribution/docker/docker-compose.yml up -d
```

![Docker Compose Up Druid](/docker-compose-up-druid.png)

After a successful deployment, you can access the Druid console by navigating to: `http://<your_ip_address>:8888/`

![Apache Druid Dashboard](/apache-druid-dashboard.png)

From here, you can check the services running in your cluster:

![Apache Druid Services](/apache-druid-services.png)

Let's list the main components visible on the dashboard:
- **Load data:** This is where you configure where Druid will pull data from, how to parse the data, and configure data storage.
- **Datasources:** This section shows the datasets that have been ingested and stored.
- **Supervisor:** This is where Druid monitors the working Peons.
- **Tasks:** This section displays the results and statuses of the tasks executed by the Peons.
- **Segments:** Contains information about the data segments.

There is another very important component: the `environment` file located at `distribution/docker/environment`. This file contains configurations for XMX, XMS, general configs, loaded extensions, Druid-specific settings, etc. 

You can view its contents below:

```bash
cat distribution/docker/environment
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

Through this lab, you have seen the various components of Apache Druid, giving you a comprehensive overview of the system and how it works. You also understand how Druid scales its components to enhance performance, leveraging its OLAP power and real-time data querying capabilities. 

I hope you found this article helpful!