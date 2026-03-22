---
title: "What is Redis and applications of Redis in Production Environment"
description: "introducting redis"
pubDate: "March 23 2026"
heroImage: "/Redis-Introduction.png"
---
In this article, i will provide an overview of Redis.

## What is Redis?

**Reddis (REmote Dictionary Server)** - an open-source to use structure data, can be ussed like a **DB (Database)**, a cache or a message broker. 
**Redis** is a highly powerfull and widely popular key-value data storage system.
**Redis** support various basic data structures, like:
  - string
  - hash
  - list
  - set
  - sort set

*I will explain all type of datas in detail below*
All data stored in Redis will be saved in RAM, and this is why redis is capable of handling a millions of request per second. Beside, Redis allows to store in disk called Persistent redis *(optional)* when system have problems.

## Redis in production environment.

1. Caching.

Redis can be used as a cache layer. Cause highly perform in write and read, redis can share data store between applications, or temporary database. Redis can serve frequenly requested data with response of time less than a milisecond. You can also easily scale up to handle higher loads without need for costly infratrcuture upgrades. Session caching and web page caching such as images, file, metadata,... are common example of use cases with Redis.
2. Counter.

Redis have ability to rapid increment and decrement value while data stored in RAM, *set* and *sorted sets* are used to count a request into a website, or manage a leaderboard in game. Redis thread-safe, so it can be synchrnize data across multiple requests.
3. Publish/subscribe (Pub/Sub).

Redis can create channels to facilitate data between **Pub** and **Sub** like a channel in **Socket Cluster** or topic in **apache Kafka**. For instance, Pub and Sub are used to monitor and analyze connection in social networks or chat systems.
4. Queues.

Creating queues to process requests sequentially. Redis allows data storage in the form of lists, and provide many actions to interact with list, so redis can use like a message queues.

## Data types supported.

1. STRING

The String is the most fundamental data type in Redis. Redis strings are stored in a binary format, allowing them to hold any type of data—such as JPEG images or Ruby objects. The maximum length of a string value is 512MB.
```bash
127.0.0.1:6379> set myname TranPhanVinhSang
OK
127.0.0.1:6379> get myname
"TranPhanVinhSang"
```
By using **GET** and **SET**, we can get any value of key and get value of key. You can explore common commands with string [Here](https://redis.io/docs/latest/commands//?group=string)
<span class="text-red-500">Warning:</span> SET can be change any value of KEY already exist or not, so be careful. 

2. LIST

LIST data type is simply a list of strings, ordered by insertion sequence. You can add elements to the head or tail of a list using LPUSH or RPUSH.
```bash
127.0.0.1:6379> KEYS *
(empty list or set)
127.0.0.1:6379> lpush users user_1      //add an element to left-end
(integer) 1
127.0.0.1:6379> KEYS *
1) "users"
127.0.0.1:6379> lpush users user_2
(integer) 2
127.0.0.1:6379> rpush users user_3     //add an element to right-end
(integer) 3
127.0.0.1:6379> lrange users 0 10      //list all elements on list
1) "user_2"
2) "user_1"
3) "user_3"
127.0.0.1:6379> lpop users            //remove and get an left-end element in list
"user_2"
127.0.0.1:6379> rpop users            //remove and get an rightend element in list
"user_3"
127.0.0.1:6379> lpop users
"user_1"
127.0.0.1:6379> KEYS *
(empty list or set)
```
You can explore common commands with LIST [Here](https://redis.io/docs/latest/commands/?group=list)

3. SET

SET is an unordered collection of strings. Sets support operations for adding, reading, and deleting individual elements, as well as checking for the presence of an element within the set, all with a default time complexity of O(1)—regardless of the total number of elements in the set. Additionally, Redis supports set operations, including intersection, union, and difference. The maximum number of elements allowed in a single Set is 2<sub>32</sub> - 1 (4,294,967,295—more than 4 billion elements per set). Example:
```bash
127.0.0.1:6379> sadd users user_1
(integer) 1
127.0.0.1:6379> sadd users user_2
(integer) 1
127.0.0.1:6379> sadd users user_3
(integer) 1
127.0.0.1:6379> smembers users
1) "user_3"
2) "user_2"
3) "user_1"
127.0.0.1:6379> spop users
"user_1"
127.0.0.1:6379> smembers users
1) "user_3"
2) "user_2"
127.0.0.1:6379> 
```
You can explore common commands with SET [Here](https://redis.io/docs/latest/commands/?group=set)

4. HASHES

HASG is a data type that stores a **hash table** of key-value pairs, where the keys are arranged randomly and do not follow any specific order. HASH is typically used to store objects (such as a user with fields like name, age, address, etc.). Each hash can store up to 2<sub>32</sub> - 1 key-value pairs. Redis supports operations for adding, reading, and deleting individual elements, as well as retrieving all values ​​within a hash.
```bash
127.0.0.1:6379> hmset user:1 name Sang email vinhsang7410@gmail.com age 23
OK
127.0.0.1:6379> hgetall user:1
1) "name"
2) "Sang"
3) "email"
4) "vinhsang7410@gmail.com"
5) "age"
6) "23"
127.0.0.1:6379> hset user:1 age 20
(integer) 0
127.0.0.1:6379> hgetall user:1
1) "name"
2) "Sang"
3) "email"
4) "vinhsang7410@gmail.com"
5) "age"
6) "20"
```
You can explore common commands with SET [Here](https://redis.io/docs/latest/commands/?group=hash)

5.SORTED SET (ZSET)

ZSET is a collection of unique strings, where each element consists of a mapping between a string (member) and a floating-point number (score). The list is sorted based on these scores; while the members themselves must be unique, the scores may be duplicated. With a Zset, elements can be added, modified, or deleted very rapidly (with an operation time proportional to the logarithm of the number of elements).
```bash
127.0.0.1:6379> zadd myzset 10 element_1
(integer) 1
127.0.0.1:6379> zadd myzset 2 element_2
(integer) 1
127.0.0.1:6379> zadd myzset 6 element_3
(integer) 1
127.0.0.1:6379> zrangebyscore myzset 0 100
1) "element_2"
2) "element_3"
3) "element_1"
```
You can explore common commands with SET [Here](https://redis.io/docs/latest/commands/?group=sorted_set)

## Persistent redis
Beside stored key-vale on RAM, redis also have 2 background threads dedicated to periodically writing data to the hard disk.
There are 2 type of file wrtiten to disk:
  - RDB (Redis DataBase file)
  - AOF (Append Only File)
### RDB (Redis DataBase file)
RDB create a snapshot of redis to save into disk after regular interval.

#### Advantages
RDB allows users to save different versions of the database, which is highly convenient in the event of a system failure.
By storing data in a single static file, users can easily transfer that data to various data centers or servers.
When restarting a server, using RDB to handle large datasets offers faster performance compared to using AOF.

#### Disadvantages
RDB is not an ideal choice if your primary goal is to minimize the risk of data loss.
Typically, users configure the system to generate RDB snapshots every 5 minutes (or more frequently). Consequently, in the event of a system failure that renders Redis inoperable, any data generated during the final minutes leading up to the incident will be lost.
RDB relies on the *fork()* system call to create a child process dedicated to handling disk I/O operations. If the dataset is exceptionally large, the *fork()* process can be time-consuming; during this interval—which may last anywhere from a few milliseconds to a full second, depending on the data volume and CPU performance—the server will be unable to respond to client requests.

### AOF (Append Only File)
AOF records all write operations received by the server; these operations are replayed when the server restarts or when the initial dataset is reconstructed.

#### Advantages
Using AOF helps ensure greater data durability compared to using RDB. Users can configure Redis to log either every command executed or once per second.
Redis writes AOF logs by appending new entries to the end of the existing file; consequently, file-seeking operations are unnecessary. Furthermore, even if only a partial command is written to the log file—for instance, due to a full disk—Redis possesses built-in mechanisms to detect and repair such errors (via *redis-check-aof*).
Redis also provides a background process that allows for the rewriting of the AOF file when it grows excessively large.

#### Disadvantages
AOF files are typically larger than RDB files for the same dataset.
AOF can be slower than RDB, depending on how the disk persistence frequency is configured. However, if configured to log once per second, it can achieve performance comparable to RDB.
Redis developers have occasionally encountered bugs with AOF (albeit very rarely), specifically instances where the AOF file failed to accurately reconstruct the dataset upon restarting Redis. This type of error has never been observed when working with RDB.

## Conclution.
Through this article, you can gain a better understanding of Redis—specifically how it is used and applied in production environments. We will also be covering a few labs related to Redis.