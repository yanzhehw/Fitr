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

**1.3.1 Data Hierarchy**

**The engine computes a recommendation using a layered approach, with more specific data sources taking priority over general ones:**

| Priority | Data Source | Description |
| :---- | :---- | :---- |
| 1 (Highest) | User's own purchase history | If the user has bought this exact product/SKU before and confirmed fit, use that size directly. |
| 2 | Community purchase data | Aggregate sizing data from other Fitr users with similar body profiles who bought this product. |
| 3 | Cross-brand size translation | Normalized mapping tables: e.g., the user fits Nike M in tops → engine maps this to the equivalent at the target brand for the same category. |
| 4 (Lowest) | Brand size chart approximation | Approximate user body measurements (from height/weight/body type) and match against the brand's published size chart. |

**1.3.2 Body Metric Approximation**

For users who do not enter body measurements, Fitr approximates key metrics (chest, waist, hip, inseam, shoulder width for clothing; foot length for shoes) using a model based on height, weight, and self-reported body type. This model we will connect later.

**1.3.3 Size Normalization**

All brand sizes are mapped to a Fitr-internal normalized size scale. This allows cross-brand comparison. For example, Fitr may define that "Nike Men's Tops M" corresponds to a chest range of 96–104 cm in its internal model, while "New Balance Men's Tops S" covers 94–102 cm. When a user who fits Nike M shops at New Balance, the engine identifies the overlap and recommends accordingly.

**Normalization tables are managed through an internal admin panel (see Section 1.6) and are initially populated from publicly available brand size charts.**

**1.3.4 Confidence Display**

**For v1, recommendations are always displayed at full confidence regardless of data availability. The system does not surface uncertainty levels to the user. Internally, however, the engine should log which data tier (1–4) was used for each recommendation for analytics and future iteration.**

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

| Entity | Key Fields | Notes |
| :---- | :---- | :---- |
| User | id, username, height, weight, body_type, gender_category, measurements (optional), social_proof_opt_in | Core profile. Measurements nullable. |
| KnownFit | user_id, brand, product_category, size | Self-reported fits from onboarding or corrections. |
| Brand | id, name, enabled, region | Managed via admin panel. |
| BrandSizeChart | brand_id, gender_category, product_category, size_label, measurements (JSON) | Source of truth for size chart approximation. |
| NormalizedSizeMap | brand_id, gender_category, product_category, size_label, fitr_internal_size | Maps brand sizes to Fitr's internal normalized scale. |
| Purchase | user_id, product_sku, brand, product_category, size, timestamp, fit_status | fit_status: pending / confirmed / corrected. |
| ScraperConfig | brand_id, url_pattern, selectors (JSON), confirmation_pattern | Loaded by extension for page detection. |

**4. Privacy & Security (Technical Requirements)**

* The extension must not scrape or transmit any data from non-supported pages. Content scripts are only activated on URL patterns matching the scraper registry.
* Purchase data must be transmitted over HTTPS and stored encrypted at rest.
* Social proof entries must only be returned by the API when there are 3 or more qualifying entries for a product, preventing de-anonymization of individual buyers.
* Usernames in social proof responses must be truncated to first 3 characters (e.g., Yan***) before leaving the backend.
* Social proof data must only be included in API responses for users whose `social_proof_opt_in` flag is true.
* Account deletion must purge the user record and all associated KnownFit, Purchase, and consent records.
