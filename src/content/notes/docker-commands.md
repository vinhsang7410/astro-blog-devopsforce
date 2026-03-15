---
title: note from docker
description: Quick Docker command notes
pubDate: 2026-03-15
tags: ["docker", "note"]
---

```bash
docker build -t <image_name>:<tag> <path to Dockerfile>
docker run --rm -p 8080:80 <image_name>:<tag>
docker logs -f <container_name>
```
