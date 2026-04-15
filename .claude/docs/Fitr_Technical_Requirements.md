**Fitr**
Technical Requirements Document
*AI-Powered Cross-Brand Sizing Advisor*
Version 1.0  |  March 2026

**Document Overview**

This document specifies the technical implementation requirements for Fitr v1.0 (MVP). It covers the onboarding flow, product page detection, recommendation engine, UI components, purchase tracking pipeline, admin panel, system architecture, and data model.

| Product Type | Chrome Browser Extension + Backend Service |
| :---- | :---- |
| **Region (v1)** | Single region (North America) |
| **Supported Categories** | Clothing (tops, bottoms, outerwear) and shoes (standard length sizing) |
| **v1 Supported Brands** | Nike, adidas, New Balance |

**1. Feature Specifications**

**1.1 User Onboarding**

**The onboarding flow is the extension's first impression. It is lightweight and non-invasive, only asking easy questions.**

**1.1.1 Required Fields**

| Field | Input Type | Notes |
| :---- | :---- | :---- |
| Username* | Text (3+ characters) | First 3 characters used for anonymized social proof display (e.g., Yan***) |
| Height* | Numeric + unit toggle (cm / ft-in) | Used for body metric approximation |
| Weight* | Numeric + unit toggle (kg / lbs) | Used for body metric approximation |
| Body Type* | Visual selector (e.g., slim, average, athletic, broad) | Combined with height/weight for measurement inference |
| Gender Category* | Men's / Women's / Unisex | Determines which size charts to reference |

**1.1.2 Optional Fields (Non-Pushy)**

| Known Fits | Brand + Product Category + Size (repeatable) | Minimum 1 entry recommended; e.g., Nike > Running Shoes > US 10 |
| :---- | :---- | :---- |

Body measurements (chest, waist, hip, inseam, shoulder width) are available as optional inputs on a secondary screen. The UI must communicate clearly that these are not required and that the system works without them. No progress bars implying incompleteness, no aggressive prompts. These measurements improve accuracy when provided but should never create friction.

**1.1.3 Consent Toggle (Implementation)**

* During onboarding, present a clear opt-in toggle for the social proof feature.
* Default state: OFF. Users must actively enable it.
* Consent state must be persisted to the user profile and editable from extension settings at any time.

**1.2 Product Page Detection & Scraping**

**1.2.1 Detection Strategy**

Fitr uses brand-specific scraper modules to identify when a user is on a supported product page. For v1, detection is primarily URL-based (e.g., matching patterns like nike.com/t/<product-slug>) with DOM confirmation as a secondary signal.

**1.2.2 Data Extracted Per Product Page**

* Brand name
* Product category (e.g., T-shirt, running shoe, hoodie, jeans)
* Product ID / SKU (for social proof matching)
* Available sizes on the page
* Product URL (for affiliate link wrapping)

**1.2.3 Scraper Architecture**

Each supported brand has a dedicated scraper configuration file that defines URL patterns, DOM selectors for product data, and the confirmation page detection pattern. This modular design allows new brands to be added without changing core logic.

| Component | Description |
| :---- | :---- |
| URL Pattern | Regex or glob for detecting product pages (e.g., nike.com/t/*) |
| DOM Selectors | CSS selectors or XPath for extracting product name, category, SKU, and size options |
| Confirmation Pattern | URL or DOM pattern for detecting order confirmation / thank-you pages |
| Category Mapping | Brand-specific product type labels mapped to Fitr's normalized categories |

**1.2.4 v1 Supported Brands**

Launch with a curated list of 3 brands: Nike, adidas, and New Balance.

**1.3 Size Recommendation Engine**

**1.3.1 Architecture Philosophy**

The recommendation engine uses predicted body measurements as the universal intermediate layer. Rather than mapping height/weight directly to a size label, the engine first predicts a user's MeasurementVector (chest, waist, hip, inseam, shoulder_width, foot_length, length, thigh), then matches that vector against a brand's size chart entries which are defined in measurement ranges. This makes cross-brand translation tractable: all brands define their sizes in measurement ranges, so the measurement vector itself is the universal scale — no secondary normalization layer is needed.

**1.3.2 Data Hierarchy**

| Priority | Data Source | Description |
| :---- | :---- | :---- |
| 1 (Highest) | User's own confirmed purchase history | User's own confirmed purchase history for this exact brand and product type. |
| 2 | Measurement approximation | Run approximation model from height/weight/body_type → MeasurementVector → overlap score against target brand's size chart entries. |
| 3 | Community data | Weighted vote from users within ±3cm height and ±3kg weight who purchased this exact product/SKU. |
| 4 (Lowest) | Known fit translation | User's self-reported KnownFit for the same category at another brand → compute the midpoint of each measurement range for that size at Brand A → use those midpoints as a pseudo-measurement vector → run overlap scoring against Brand B's size chart entries. |

**1.3.3 Body Metric Approximation**

The approximation model produces a MeasurementVector from height_cm, weight_kg, and body_type:
- Base predictions are statistical estimates: e.g., chest_cm ≈ f(height, weight), length_cm ≈ f(height)
- Body type applies a shape modifier: slim subtracts from chest/waist/hip/thigh; athletic/broad adds
- length_cm is predicted primarily from height and is category-agnostic at the model level — its semantic meaning (top length vs. pant length) is resolved at scoring time by the product category
- When the user provides exact body measurements, those override the predictions entirely
- When the user has confirmed KnownFits, the system can back-calibrate predictions toward ground truth over time

**1.3.4 Overlap Scoring**

For Priority 2 matching, the engine computes an overlap score for each SizeChartEntry:
- Overlap = how much of the user's predicted measurements fall within the entry's measurement ranges for the axes relevant to that product category
- Category-aware scoring axes:
  - Tops / T-shirts: chest_cm (primary), shoulder_width_cm (secondary), length_cm (tertiary)
  - Hoodies / Outerwear: chest_cm (primary), shoulder_width_cm (secondary), length_cm (tertiary)
  - Bottoms / Pants: waist_cm (primary), inseam_cm (secondary), length_cm (tertiary), thigh_cm (quaternary)
  - Shoes: foot_length_cm only (width is a future phase)
- Axes are weighted by priority order — primary axes contribute more to the overlap score than secondary or tertiary axes
- The size label with the highest weighted overlap score is recommended

**1.3.5 Known Fit Translation (Priority 4)**

When a user has a KnownFit at Brand A for the same category, the engine looks up the measurement ranges for that size label in Brand A's size chart, computes the midpoint of each relevant axis (e.g., midpoint of chest_min and chest_max, length_min and length_max), and uses those midpoints as a pseudo-measurement vector. It then runs the same overlap scoring used in Priority 2 against Brand B's size chart entries, respecting the same category-aware axis weighting. The size label with the highest overlap wins. This reuses the measurement ranges as the universal scale — no secondary normalization needed.

**1.3.6 Confidence Display**

For v1, recommendations are always displayed at full confidence regardless of data availability. The system does not surface uncertainty levels to the user. Internally, however, the engine logs which priority tier (1–4) was used per recommendation for analytics.

**1.4 Recommendation UI (Extension Popup)**

**1.4.1 Trigger**

The popup appears automatically when the user navigates to a supported product page. It should appear as a fixed position overlay. It is non-blocking but visible.

**1.4.2 Popup Content**

The popup contains two sections in a single view:

**Section A: Size Recommendation**

* Recommended size displayed prominently (e.g., "We recommend: Size S")
* Brand and product category context (e.g., "for New Balance Men's Running Shoes")
* A subtle link to "Correct this recommendation" for manual override and feedback

**Section B: Social Proof Feed**

A scrollable list of recent Fitr users who purchased this exact product/SKU. Each entry displays:

* Anonymized username (first 3 characters + ***, e.g., "Yan***")
* Height and weight
* Size purchased

This section appears regardless of how many qualifying entries. If none exist, say no data yet.

**1.4.3 Dismissal & Persistence**

* Users can dismiss the popup for the current page. It reappears if they navigate to a different product page.
* A global toggle in extension settings allows the user to disable the auto-popup entirely and revert to manual trigger via the extension icon.

**1.5 Purchase Tracking & Feedback Loop**

**1.5.1 Purchase Detection**

**After a user adds an item to cart and completes checkout, Fitr detects the purchase by monitoring the order confirmation / thank-you page using brand-specific URL or DOM patterns. When detected, the extension logs:**

* User ID
* Product SKU / ID
* Brand and product category
* Size purchased
* Timestamp

**1.5.2 Fit Confirmation (Passive)**

Fitr uses a "true until proven false" confirmation model for v1: until a purchase is returned, the system treats it as a positive fit signal. If a return is detected, we take back that data entry.

**1.5.3 Manual Correction**

If a user receives an item and the size was wrong, they can open the extension and flag the purchase as a bad fit via the "Correct this recommendation" flow. This allows them to indicate the actual correct size or that the item ran large/small. This correction updates the user's profile and contributes to the community data pool, adjusting the cross-brand mapping over time.

**1.5.4 Return Detection (Future)**

A future iteration could detect returns by monitoring for return confirmation pages or integrating with retailer return APIs. This is out of scope for v1.

**1.6 Admin Panel (Internal)**

**An internal web-based admin panel for the Fitr team to manage brand data and monitor system health.**

**1.6.1 Brand Management**

* Add new brands with their size charts (by product category and gender)
* Edit existing size chart data
* Configure scraper definitions (URL patterns, DOM selectors, confirmation patterns)
* Enable/disable brands

**1.6.2 Analytics Dashboard**

* Total users, active users, purchases tracked
* Recommendation accuracy (corrections vs. confirmed fits)
* Most popular brands and product categories
* Data tier distribution per recommendation (how often each priority level is used)

**2. Technical Architecture**

**2.1 System Components**

| Component | Description |
| :---- | :---- |
| Chrome Extension (Frontend) | Content scripts for page detection and UI injection. Popup UI for recommendations and social proof. Options page for profile management and settings. |
| Backend API | RESTful API handling user auth, profile management, recommendation requests, purchase logging, and correction submissions. Hosts the recommendation engine logic. |
| Database | Stores user profiles, purchase history, brand size charts, normalized size mapping tables, and community aggregate data. |
| Admin Panel | Internal web app for brand/size chart management and analytics. Separate from the consumer-facing extension. |
| Scraper Registry | Modular configuration store for brand-specific scraper definitions. Loaded by the extension to determine supported sites and extraction rules. |
| Approximation Model | First-class backend component that receives height_cm, weight_kg, body_type and returns a MeasurementVector. Invoked at profile creation/update; output is cached on the User record as predicted_measurements. |

**2.2 Data Flow**

1. User navigates to a product page.
2. Extension's content script matches URL against scraper registry and extracts product data.
3. Extension calls backend API: GET /recommend with user ID, brand, product category, and SKU.
4. Backend engine evaluates data hierarchy (own history → community data → cross-brand translation → size chart) and returns recommended size + social proof entries.
5. Extension renders popup with recommendation and social proof feed.
6. On purchase confirmation detection, extension calls POST /purchase to log the transaction.
7. After 30-day window without correction, purchase is auto-confirmed as positive fit data.

**2.3 Affiliate Integration**

**The extension wraps outbound links (or injects affiliate parameters) before the user completes a purchase. Implementation details depend on per-brand affiliate program requirements (e.g., URL parameter injection, cookie-based tracking, or redirect through an affiliate network). The affiliate layer must be invisible to the user experience and must not override an existing referral cookie if one is present.**

**3. Data Model (Key Entities)**

**User**
- id, username, height_cm, weight_kg, body_type, gender_category (mens|womens|unisex)
- body_type depends on gender_category:
  - Mens: inverted_triangle | rectangle | oval
  - Womens: apple | pear | hourglass | cane_sugar | athletic
- predicted_measurements: MeasurementVector (computed, cached, recomputed when profile changes)
- exact_measurements: MeasurementVector | null (user-provided, overrides predictions)
- measurement_confidence: low|medium|high (reflects how much ground truth data backs the prediction)
- social_proof_opt_in: boolean

**MeasurementVector** (embedded/nested, not a standalone table)
- chest_cm, waist_cm, hip_cm, inseam_cm, shoulder_width_cm, foot_length_cm, length_cm, thigh_cm
- All fields nullable — only relevant fields populated per user's available data
- length_cm represents the garment's full vertical length; its semantic meaning is resolved at scoring time by product category (top length vs. pant length)
- thigh_cm is only scored for bottoms/pants

**KnownFit**
- id, user_id, brand_id, product_category (normalized enum), size_label
- source: self_reported | purchase_confirmed | corrected

**Brand**
- id, name, enabled, region

**BrandSizeChart**
- id, brand_id, gender_category, product_category
- entries: list of BrandSizeChartEntry

**BrandSizeChartEntry**
- id, size_chart_id, size_label
- measurement_ranges: { chest_cm, waist_cm, hip_cm, inseam_cm, shoulder_width_cm, foot_length_cm, length_cm, thigh_cm } each as [min, max] — only relevant axes populated per product category

**NormalizedCategory** (enum referenced by multiple entities)
- tops, bottoms, outerwear, shoes

**Purchase**
- id, user_id, product_sku, brand_id, product_category, size_label, timestamp
- fit_status: pending | confirmed | corrected
- recommendation_tier_used: 1|2|3|4 (which priority level produced the recommendation)

**ScraperConfig**
- No change from original.

**4. Privacy & Security (Technical Requirements)**

* The extension must not scrape or transmit any data from non-supported pages. Content scripts are only activated on URL patterns matching the scraper registry.
* Purchase data must be transmitted over HTTPS and stored encrypted at rest.
* Social proof entries must only be returned by the API when there are 3 or more qualifying entries for a product, preventing de-anonymization of individual buyers.
* Usernames in social proof responses must be truncated to first 3 characters (e.g., Yan***) before leaving the backend.
* Social proof data must only be included in API responses for users whose `social_proof_opt_in` flag is true.
* Account deletion must purge the user record and all associated KnownFit, Purchase, and consent records.
