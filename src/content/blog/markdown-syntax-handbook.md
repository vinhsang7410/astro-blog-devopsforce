---
title: Markdown Syntax Handbook for Astro Blog Writing
description: A practical and detailed guide to writing Markdown content in this Astro blog, including headings, emphasis, lists, tables, quotes, code blocks, links, images, and authoring tips.
pubDate: 2026-03-22
updatedDate: 2026-03-22
heroImage: /blog-placeholder-3.jpg
---

# Markdown Syntax Handbook

This article is a practical guide for writing Markdown files inside this Astro blog. It is also a live demo for `Astro.props.headings`, because the layout can now read the generated headings and build a table of contents automatically.

## Why Markdown Works So Well in Astro

Markdown keeps writing simple, readable, and easy to maintain in Git. You can focus on the content first and still get a nicely rendered page after Astro processes the file.

### Good reasons to use Markdown

- The raw file is clean and easy to review in git diff.
- You can write quickly without touching HTML for every paragraph.
- Astro can extract metadata, headings, and content structure.
- It fits very well for blogs, notes, documentation, and project writeups.

### What Markdown usually contains

A Markdown post in this blog normally contains:

- Frontmatter
- Headings
- Paragraphs
- Lists
- Links
- Code blocks
- Tables
- Images
- Quotes

## Frontmatter

Frontmatter is the metadata block at the top of a file. It is wrapped by triple dashes.

### Example frontmatter

```yaml
---
title: My Post Title
description: Short summary of the article
pubDate: 2026-03-22
updatedDate: 2026-03-22
heroImage: /blog-placeholder-1.jpg
---
```

### Fields used in this blog

- `title`: the article title
- `description`: short summary used in metadata and listings
- `pubDate`: publish date
- `updatedDate`: optional update date
- `heroImage`: optional top image

## Headings

Headings define the structure of your article. They also make the page easier to scan and help Astro generate a heading list.

## Heading Levels

Use the number of `#` symbols to control the heading level.

### Examples

```md
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
```

### Recommended usage

- Use one `#` heading for the main article title inside the content body if you want it visually repeated.
- Use `##` for main sections.
- Use `###` for subsections.
- Use `####` only when the section really needs more depth.

## Paragraphs and Line Breaks

Plain text separated by a blank line becomes a paragraph.

### Normal paragraph example

```md
This is the first paragraph.

This is the second paragraph.
```

### Line break note

If you want a new line without a new paragraph, Markdown behavior can vary. In most cases, using a new paragraph is cleaner and more predictable.

## Text Formatting

Markdown supports several forms of inline emphasis.

### Bold and italic

```md
**bold**
*italic*
***bold italic***
```

### Inline code

Use backticks for commands, file names, variables, and short code references.

```md
Run `docker ps` to list containers.
```

### Strikethrough

```md
~~old text~~
```

## Lists

Lists are useful for steps, checklists, and grouped ideas.

## Unordered lists

```md
- Docker
- Kubernetes
- Cloudflare
```

### Alternative markers

You can also use `*` or `+`, but it is better to stay consistent in one article.

## Ordered lists

```md
1. Install dependencies
2. Write the content
3. Push the changes
```

### Mixed lists

Be careful when mixing nested ordered and unordered lists because indentation matters.

## Blockquotes

Blockquotes are useful for notes, warnings, and quoted text.

### Example

```md
> This is a quoted line.
> It can continue on the next line.
```

> This is a rendered blockquote example.
> It is useful for highlighting a note or thought.

## Links

Links connect your article to references, related articles, or tools.

### Inline link

```md
[Astro Documentation](https://docs.astro.build/)
```

### Autolink style

Some Markdown processors support direct URLs, but explicit links are usually cleaner.

## Images

Images help break up long sections and make technical writing easier to follow.

### Basic image syntax

```md
![Alt text](/blog-placeholder-1.jpg)
```

### Image writing tips

- Always write useful alt text.
- Keep file names organized.
- Use screenshots only when they add clarity.

## Code Blocks

Code blocks are one of the most important parts of technical writing.

## Fenced code block

Use triple backticks before and after the code.

````md
```bash
docker ps
```
````

### Language highlighting

Add the language name after the opening backticks.

```bash
docker ps
kubectl get pods -A
git status
```

### Common language labels

- `bash`
- `json`
- `yaml`
- `ts`
- `js`
- `html`
- `css`
- `md`

## Tables

Tables are useful for comparison and quick reference.

### Table syntax

```md
| Tool | Purpose | Example |
| --- | --- | --- |
| Docker | Containers | docker ps |
| kubectl | Kubernetes management | kubectl get pods |
| Git | Version control | git status |
```

### Example table

| Tool | Purpose | Example |
| --- | --- | --- |
| Docker | Containers | `docker ps` |
| kubectl | Kubernetes management | `kubectl get pods` |
| Git | Version control | `git status` |

## Horizontal Rules

Horizontal rules are useful when you want a clear visual separation between sections.

### Syntax

```md
---
```

## Writing Tips for Better Markdown Posts

Strong syntax is only one part of a good technical post. Structure also matters.

### Keep sections short

Short sections are easier to scan, especially on mobile and in long technical articles.

### Prefer real examples

Readers understand faster when you use practical commands instead of abstract explanation only.

### Keep heading names descriptive

Headings like `Common Errors`, `Deployment Steps`, or `Docker Compose Example` are more useful than generic names.

### Avoid giant paragraphs

Large text blocks make technical writing harder to read. Split ideas into smaller chunks.

## How the Heading Navigation Works in This Blog

This page is also a demo for the heading extraction feature.

### What Astro gives you

When Astro renders a Markdown entry, it can return both the `Content` component and the `headings` array.

### What the layout does

The blog layout reads those headings and prints a small "On This Page" navigation block on the right side.

### Why this is useful

- Readers can jump quickly between sections.
- Long tutorials become easier to navigate.
- You do not need to write the table of contents manually.

## Final Notes

Markdown is simple on the surface, but it becomes extremely powerful when combined with Astro collections, frontmatter validation, and automatic heading extraction.

### Suggested next step

Create another article in `src/content/blog/` and intentionally add many `##` and `###` headings. Then open the page and compare how the heading list changes.
