---
title: "What is Apache Kafka and applications of Kafka in Production Environment"
description: "An introduction to Apache Kafka and its core concepts"
pubDate: "March 25 2026"
heroImage: "/apache-kafka.jpg"
tags: ["kafka", "messaging", "backend"]
---
## 1. What is Apache Kafka?

Apache Kafka is a distributed platform designed to process real-time data streams. It acts as a high-speed messaging system, allowing for data collection, storage, and distribution with low latency and outstanding scalability. Developed by LinkedIn and later open-sourced, Kafka is currently the top choice for tech giants like Netflix, Uber, and Spotify to process billions of events per day.

![Apache Kafka](/kafka-1.png)

### Architecture of Kafka

Besides the above concept, Kafka is also seen as a logging system responsible for saving system states to prevent the risk of losing information.

Additionally, don't forget to track the following concepts to better understand Kafka:

*   **Producer:** Applications or systems that send data into Kafka. When data is sent, it is divided into messages and stored on the Broker as Partitions of a specific Topic.
*   **Consumer:** Applications or systems that subscribe to receive data from a Topic. Each consumer is identified by a "group name," and a topic can be read by multiple different Consumers.
*   **Topic:** In Kafka, data is transmitted via topics. When you want to transmit data to different applications, you can create separate topics for convenience in organizing and categorizing data.
*   **Partition:** A partition is where data for a topic is stored, and each topic can have multiple partitions. On a partition, data is stored persistently, and each message is assigned an ID called an offset. A partition in a Kafka cluster can be replicated across multiple copies. Among them, the leader replica is responsible for reading and writing data, while the other follower replicas are used to replace the leader if it fails. To allow multiple consumers to read a topic's data simultaneously, you need to create multiple partitions for that topic.
*   **Broker:** A Kafka cluster is a collection of servers, and each server in that collection is called a Broker. A Broker is responsible for storing topics and partitions.

## 2. Kafka Architecture Description

![Kafka Architecture](/kafka-architecture.png)

Currently, Kafka systems recommend dropping Zookeeper and replacing it with KRaft mode. I will write about the detailed reasons in the next article.

## 3. What is Kafka used for?

To better understand Kafka, let's look at the features it provides:

*   **Metrics:** Kafka is widely used to build operational monitoring data. In other words, Kafka is suitable for aggregating statistics from multiple distributed sources to create a centralized data feed.
*   **Log Aggregation:** Kafka is also used as a tool to aggregate logs or activity journals, summarizing details and providing a record of event data for future processing.
*   **Stream Processing:** Furthermore, Kafka is used for real-time data processing. As soon as new data is updated to a topic, it is immediately written to the system and transmitted to the receiver. Notably, the Kafka Streams library integrated since version 0.10.0.0 provides lightweight yet extremely fast stream processing capabilities.
*   **Event Streaming:** Event Streaming is a widely exploited feature of Kafka today. Accordingly, it collects data as real-time event streams from databases, sensors, or mobile devices and stores them for a certain period to allow future retrieval, analyze and process event streams in real-time, and route them to different target technologies when necessary.
*   **Storing streams of records in order:** Kafka stores messages (including those already sent). Thus, this data can be used to retrieve, re-consume, or re-subscribe on demand.

Besides messages, Kafka can also store massive amounts of other data to form a data warehouse. Many organizations even use Kafka to collect and process real-time data streams alongside passive data storage. This differentiates Kafka from other distributed systems.
With this feature, the amount of data stored by Kafka is massive, making it suitable for building advanced technologies like Machine Learning or Artificial Intelligence (AI).

*   **Acting as a Message Broker:** Kafka can entirely be used to replace traditional Message Brokers like ActiveMQ or RabbitMQ.

## 4. How Kafka Works

Kafka operates based on a combination of two main models: queuing and publish-subscribe.

*   **Queuing:** Allows data to be processed distributedly across multiple consumers, enabling high scalability.
*   **Publish-subscribe:** Reaches multiple subscribers simultaneously, and messages are sent to many subscribers; however, it cannot be used to distribute work among multiple workers.

## 5. Pros and Cons

In general, any company that needs to process and analyze large volumes of real-time data can benefit from using Apache Kafka. To date, thousands of different organizations use Kafka, from Internet giants to major car manufacturers, stock exchanges, etc. According to recent records, Kafka has over 5 million downloads.

### 5.1. Pros:

*   **High Performance:** Kafka supports a messaging platform with extremely high speed, capable of exceeding 100k/second (low latency). Especially, Kafka maintains stable performance with extremely large data volumes. All data is processed and logically organized by partition and order.
*   **Scalability:** Kafka is a distributed system capable of handling large data volumes that can be scaled quickly without downtime. It provides scalability by allowing partitions to be distributed across different servers.
*   **Fault Tolerance:** Kafka is a distributed system consisting of several nodes running together to serve cluster operations. This rule makes it highly capable of operating well even when a node fails or a local machine error occurs.
*   **Durability:** The Kafka system is highly durable.
*   **Easy Accessibility:** Anyone can easily access the data.
*   **Eliminating Multiple Integrations:** It eliminates multiple data source integrations because all producer data flows into Kafka. This reduces complexity, time, and costs.

### 5.2. Cons

Kafka is not perfect; it still has some limitations such as:

*   **Not suitable for historical data:** The Kafka system only allows historical data to be stored for a few hours.
*   **Occasional slow processing:** The Kafka system can become slow when the number of queues in a cluster increases, which affects overall performance.
*   **Lack of monitoring tools:** The Kafka system lacks a complete monitoring and management toolset. To overcome this, we can use third-party tools like Kafka Monitor (developed by LinkedIn), Datadog, and Prometheus to monitor Kafka clusters. Additionally, many other open-source and commercial options are available.
*   **No wildcard topic support:** The Kafka system only supports exact topic names and will not support wildcard topics. For example, if you have topics `metric_2022_01_01` and `metric_2022_01_02`, the system won't support selecting a wildcard topic like `metric_2022_*`.
*   **Inflexible processing:** Sometimes, when the number of Queues in a Kafka Cluster increases, the system exhibits sluggishness and becomes less responsive.

*Although drawbacks are being thoroughly addressed, the power of Kafka remains undeniable.*

## 6. When to Use Kafka

Kafka is an open-source project that is fully packaged with excellent performance, especially easy to scale without affecting system operations. Kafka is also highly rated for its fault tolerance.

If you are building software or a website that displays information in real-time, Kafka is the optimal choice. Some reasons you should use Kafka today include:

*   **High Scalability:** Kafka clusters can scale up to a thousand brokers, trillions of messages per day, petabytes of data, and hundreds of thousands of partitions. Accordingly, Kafka's log partitioning model allows data to be distributed across multiple servers and expanded infinitely as needed.
*   **Fast Speed:** Processing through decoupled data streams makes Kafka's speed exceptionally fast. Kafka can process millions of messages per second.
*   **Fault Tolerance and Durability:** Since data packets are replicated and distributed across multiple different servers, if an incident occurs, the data is safely stored and less prone to errors.

## 7. Kafka in Practice

Kafka possesses the ability to process and store large amounts of data in real-time quickly and accurately. Therefore, it is an ideal tool widely applied by thousands of enterprises and organizations operating in various industries. Here are some common use cases of Kafka across industries.

### 7.1. Kafka in Logistics

As you know, the data at large logistics companies is massive. Especially when processing a huge volume of orders every day from major e-commerce platforms. Even during major promotions, offers, or sales events of the year, the data volume is even more immense.

Kafka technology is completely capable of shouldering the real-time data warehouse. Accordingly, it helps the logistics operation run smoothly and ensures no bottlenecks occur.

### 7.2. Kafka in Healthcare

Currently, Kafka is gradually becoming popular in the public healthcare sector. Besides accurately processing a large amount of information, Kafka also helps organize and classify data scientifically in a certain order, making the medical examination and treatment process more convenient.

This includes deploying sensors to monitor patient conditions, including heart rate, blood pressure, or neurological parameters, thereby monitoring patient health and providing treatment regimens as well as timely and proper medical feedback.

### 7.3. Kafka in Marketing

In Marketing, Kafka is utilized to its fullest optimal features. Accordingly, media companies can use Kafka to store data on demographics, social network usage behavior, websites, and search engines. From there, they can create advertising templates tailored to customer needs.

For example: User A is searching for information about sunscreen products on a search engine. This information will be saved and processed by the system; the advertising company can record it and provide shopping suggestions right on the social networking platforms that User A uses shortly after.