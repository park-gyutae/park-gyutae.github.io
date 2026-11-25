# DESIGN.md

## 1. Identity

This website is a personal academic website,
technical blog, and research portfolio.

It is not a SaaS product, startup landing page,
commercial agency website, or marketing funnel.

Design direction:
Quiet, scholarly, restrained, precise, and content-first.

## 2. References

- jasonwei.net — academic identity
- jvns.ca — technical writing and navigation
- distill.pub — scientific communication
- danluu.com — content-first minimalism
- shikun.io/projects/clarity — research presentation

Extract design principles rather than copying layouts.

## 3. Visual Principles

- Typography before decoration.
- Content before components.
- Whitespace before borders.
- Hierarchy before color.
- Actual research before decorative graphics.
- Consistency before novelty.

## 4. Design Tokens

Background: #FFFFFF
Surface: #F5F5F5
Text: #222222
Muted text: #666666
Accent: #274B72
Border: #E0E0E0

Use one accent color.
Do not introduce new colors without justification.

Korean font: Pretendard
Body size: 17px
Body line height: 1.75
Article width: 740px
Site max width: 1080px
Border radius: 0–4px

## 5. Anti-AI Design Rules

Do not use by default:

- Decorative gradients
- Glassmorphism
- Oversized marketing heroes
- Generic bento grids
- Repeated feature cards
- Unnecessary pill badges
- Decorative Lucide icons
- Numbered section eyebrows
- Gradient text
- Floating decorative shapes
- Fake statistics
- Generic AI-generated illustrations
- Excessive scroll animations
- Unnecessary arrows after links
- Nested containers
- Excessively large empty sections

An exception requires a concrete functional reason.

## 6. Content Architecture

Home:
  Short introduction
  Selected projects
  Recent writing

About:
  Academic background
  Research interests
  Relevant activities

Blog:
  Chronological article list
  Category filtering
  Search when useful

Projects:
  Research question
  Methodology
  Implementation
  Experimental results
  Limitations
  Repository and references

## 7. Academic Content

Prioritize:

- Readable LaTeX equations
- Syntax-highlighted code
- Numbered figures and captions
- Clear theorem and proof formatting
- Tables and experimental results
- Citations and references
- Interactive scientific visualizations

Use actual project figures instead of decorative images.

## 8. Implementation Rules

Preserve existing content and functionality.

Do not redesign unrelated components.

Before implementing:
1. Read this file.
2. Inspect existing components and styles.
3. Identify which design rules are relevant.

After implementing:
1. Render in an actual browser.
2. Inspect desktop, tablet, and mobile layouts.
3. Check mathematical notation and code blocks.
4. Check accessibility and contrast.
5. Remove unnecessary decorative elements.

Do not add elements merely to make the site
appear more designed.
