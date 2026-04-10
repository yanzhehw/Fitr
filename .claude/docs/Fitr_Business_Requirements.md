**Fitr**
Business Requirements Document
*AI-Powered Cross-Brand Sizing Advisor*
Version 1.0  |  March 2026

**Document Overview**

| Product Name | Fitr |
| :---- | :---- |
| **Version** | 1.0 (MVP) |
| **Product Type** | Chrome Browser Extension + Backend Service |
| **Target Market** | Online clothing and footwear shoppers (B2C); e-commerce retailers (future B2B) |
| **Region (v1)** | Single region (North America) |
| **Monetization (v1)** | Affiliate commission on purchases; free for consumers, or business subscription |
| **Supported Categories** | Clothing (tops, bottoms, outerwear) and shoes (standard length sizing) |

**1. Problem Statement**

**Online clothing shoppers face a common sizing problem:**

- **Sizes are not standardized across brands.**
- **A Medium at Nike doesn't correspond to a Medium at New Balance, Zara, or Uniqlo. This results in uncertainty, higher sales friction and higher changes of incorrect purchases, which leads to costly returns.**

**Current sizing solutions are insufficient (Size Charts):**

- **Size charts require customers to take precise body measurements (chest circumference, inseam length, etc.) Most people don't know their precise measurements.**
- **Taking measurements kills momentum from browsing sessions. Adds friction to sale.**
- **Size charts cannot account for real-world fit variance between product lines between different brands.**
- **More importantly, it causes unnecessary confusion for consumers, if they have a chest circumference that fits an Medium, and total length that suggests a Small. Difficult decisions forces them to hesitate the purchase, or do tedious research.**

**In summary:**

- **This problem is expensive for all parties. For consumers, it creates friction and erodes confidence in online purchases. For retailers, clothing return rates average 20–30%, with sizing cited as the primary reason. Each return incurs shipping, restocking, and customer service costs.**

**2. Solution Overview**

**Fitr is a Chrome browser extension that acts as a personal sizing advisor across all supported online clothing and footwear stores. It combines user profile data, publicly available brand size charts, and anonymized community purchase data to recommend the best size for any product the user is browsing.**

**2.1 Core Value Proposition**

* **Cross-brand size translation:** Know your Nike M means New Balance S without guessing.
* **Zero-measurement onboarding:** Approximate body metrics from height, weight, and body type—no tape measure required.
* **Community-powered social proof:** See what sizes real buyers with similar body types purchased for the same product.
* **Compounding accuracy:** Every purchase and user correction feeds back into the system, making recommendations more precise over time.

**2.2 How It Works (High-Level)**

1. The user installs the Chrome extension, creates a profile and completes on boarding with
   1. height, weight, body type, gender category
   2. Past brand + category + size combinations they know fit well
2. When the user navigates to a supported product page, Fitr automatically detects the brand, product category, and available sizes via brand-specific scrapers.
3. Fitr's engine cross-references the user's profile against the brand's size chart, normalized size translation tables, and community purchase data to produce a size recommendation.
4. A popup appears showing the following:
   1. recommended size
   2. Feed of 3 recent verified buyers with most similar body metrics(height and weight) who purchased the same product—including their height, weight, and chosen size.
5. When the user completes a purchase (detected via order confirmation page), the transaction is logged. This data is treated as a positive signal and fed back into the recommendation engine. If the item is returned, we take back this piece of data.

**3. User Personas**

**3.1 Primary: The Online Shopper**

Demographic: 18–45, shops online for clothing and shoes. Comfortable with browser extensions. Frustrated by inconsistent sizing and return hassle.

Goal: Buy the right size on the first attempt, especially when trying a new brand for the first time.

Pain point: Tired of manually comparing size charts, does not want to measure themselves; wants more seamless shopping experience.

**3.2 Secondary: The E-Commerce Retailer (Future B2B)**

Big businesses: when they have a niche product line, or slim fit vs regular fit. Users have more confidence with cross referencing.

Smaller Businesses: less established brand, so size translation from more known brands are most reliable.

Goal: Reduce return rates and increase conversion confidence on product pages.

Pain point: Sizing-related returns are a major cost center. Existing size chart solutions do not leverage cross-brand intelligence.

**4. Privacy & Data Consent (Policy)**

* During onboarding, users are presented with a clear opt-in toggle for the social proof feature: "Allow my anonymized purchase data (username snippet, height, weight, size purchased) to appear to other Fitr users browsing the same product."
* Default state: OFF. Users must actively enable it.
* This consent can be changed at any time in the extension settings.
* Social proof data is only displayed for users who have explicitly opted in during onboarding. Opt-in default is OFF.
* Usernames in social proof are truncated to first 3 characters (e.g., Yan***). These are chosen by the user at signup and do not need to be real names.
* Social proof entries are only shown when there are 3 or more qualifying entries for a product, preventing de-anonymization of individual buyers.
* Users can delete their account and all associated data at any time from the extension settings.
* A clear and accessible privacy policy must be published before launch, covering data collection scope, storage practices, third-party sharing (affiliate networks), and GDPR/CCPA-equivalent rights.

**5. Monetization**

Fitr monetizes through affiliate programs. When a user is on a supported product page, the extension wraps outbound links (or injects affiliate parameters) before the user completes a purchase. Implementation details depend on per-brand affiliate program requirements (e.g., URL parameter injection, cookie-based tracking, or redirect through an affiliate network). The affiliate layer must be invisible to the user experience.

**6. Success Metrics**

| Metric | Definition | Target (6-month) |
| :---- | :---- | :---- |
| Recommendation Accuracy | % of purchases auto-confirmed (no correction within 30 days) | > 80% |
| User Retention (30-day) | % of users who trigger a recommendation at least once in 30 days post-install | > 40% |
| Purchases Tracked | Total purchases logged through the extension | Directional growth MoM |
| Social Proof Coverage | % of product pages with 3+ social proof entries | > 25% on supported brands |
| Correction Rate | % of purchases flagged as bad fit | < 20% (decreasing) |
| Affiliate Revenue | Monthly commission from tracked purchases | Positive and growing |

**7. Phased Roadmap**

**Phase 1: Prototype (Months 1–2)**

* Chrome extension with onboarding flow and profile management
* 2–3 brand scrapers with product page detection and size extraction
* Recommendation engine using size chart approximation and cross-brand translation (Priority 3–4 data)
* Basic popup UI with size recommendation (no social proof yet)
* Backend API and database scaffolding
* Purchase detection on confirmation pages

**Phase 2: MVP Launch (Months 3–4)**

* Expand to fewer than 10 brands
* Social proof feed activated (requires sufficient user base)
* Admin panel for brand and size chart management
* Affiliate link integration for monetization
* Manual correction flow for bad recommendations
* Analytics dashboard (basic)

**Phase 3: Growth (Months 5–8)**

* Scale to 20–50 brands with streamlined scraper onboarding
* Community data begins to power Priority 2 recommendations meaningfully
* Passive fit confirmation system (30-day window) fully operational
* Explore Firefox extension
* Explore multi-region sizing (US/UK/EU conversion layer)

**Phase 4: Platform (Months 9+)**

* B2B integration: offer Fitr as an embeddable widget or API for retailer websites
* Active post-purchase fit surveys for higher-fidelity feedback
* Fit preference modeling (tight/regular/loose) based on accumulated data
* Shoe width support
* Return detection integration

**8. Risks & Mitigations**

| Risk | Impact | Mitigation |
| :---- | :---- | :---- |
| Cold start: insufficient community data early on | Recommendations rely heavily on size chart approximation, which is less accurate | Seed normalization tables thoroughly from public data. Prioritize brands with well-documented size charts. Recruit early users from sizing-frustrated communities. |
| Scraper fragility: retailer site redesigns break scrapers | Extension stops working on affected brands until scraper is updated | Monitoring and alerting on scraper failures. Modular scraper architecture for fast updates. Version scraper configs server-side so updates don't require extension updates. |
| Privacy backlash: users uncomfortable with purchase tracking | Low adoption or negative reviews | Transparent opt-in, clear privacy policy, easy data deletion. Social proof is strictly opt-in with default OFF. |
| Affiliate link interference: conflicts with existing affiliate cookies | Revenue loss or user confusion | Research affiliate program ToS carefully. Ensure Fitr's affiliate injection does not override the user's existing referral if one exists. |
| Inaccurate approximation model at launch | Users lose trust if first recommendation is wrong | Log recommendation data tier internally. Fast-track manual corrections into the feedback loop. Iterate on approximation model aggressively. |

**9. Open Questions for Future Iterations**

1. Should Fitr offer a browser badge indicator on the extension icon when a supported page is detected (to reinforce awareness even when the popup is dismissed)?
2. What is the right threshold for the passive fit confirmation window (30 days)? Should it vary by product category (shoes may take longer to determine fit than t-shirts)?
3. How should the system handle multi-size purchases (e.g., user buys two sizes of the same item to try)? Which one becomes the positive signal?
4. Should there be a "fit score" or rating alongside the recommendation in future versions to communicate confidence without undermining trust?
5. When is the right time to introduce active post-purchase surveys without creating fatigue?
