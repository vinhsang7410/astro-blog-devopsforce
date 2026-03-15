---
title: Build a Static CDN
description: Small project notes for serving static assets through a CDN
pubDate: 2026-03-15
tags: ["docker", "projects"]
---

```bash
docker build -t <image_name>:<tag> <path to Dockerfile>
docker run --rm -p 8080:80 <image_name>:<tag>
```

This project is a small experiment around packaging static content and serving it behind a CDN-friendly edge setup.
