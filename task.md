Your job is to make three coordinated updates:
1. Update the PRD to reflect the new measurement-pipeline architecture
2. Create a backend API specification document
3. Create a database schema file

---

## CONTEXT: The Architecture Decision

We have decided on a **measurement vector as the universal intermediate layer** for matching 
users to brand size charts. This replaces any notion of a direct height×weight lookup table.

The pipeline is:

  User (height, weight, body_type)
          ↓
    [Approximation Model]
          ↓
  Predicted MeasurementVector  ←→  BrandSizeChart (measurement ranges per size label)
          ↓
     Size Recommendation

**Why this matters:**
- Body measurements (chest, waist, hip, inseam, shoulder_width, foot_length) are the actual 
  language that all size charts are written in — they are the universal currency
- Cross-brand translation works by comparing measurement ranges directly — no secondary 
  normalization scale needed
- Body type acts as a shape modifier on top of the height/weight base prediction, not a 
  separate lookup axis
- The overlap score between user's predicted measurements and a size entry's measurement 
  ranges is category-aware (tops care about chest/shoulder; bottoms care about waist/inseam; 
  shoes only care about foot_length)

**Primary measurement axis by category:**
- Tops / T-shirts → chest_cm (primary), shoulder_width_cm (secondary), length_cm (tertiary)
- Hoodies / Outerwear → chest_cm (primary), shoulder_width_cm (secondary), length_cm (tertiary)
- Bottoms / Pants → waist_cm (primary), inseam_cm (secondary), length_cm (tertiary), thigh_cm (quaternary)
- Shoes → foot_length_cm only (width is a future phase)

---

## TASK 1: Update Fitr_PRD.md

Make surgical updates to the following sections only. Do not rewrite unrelated sections.

### Update Section 4.3 — Size Recommendation Engine

Replace the existing 4.3 content with the following updated version:

**4.3.1 Architecture Philosophy**
The recommendation engine uses predicted body measurements as the universal intermediate layer. Rather than mapping height/weight directly to a size label, the engine first predicts a user's MeasurementVector (chest, waist, hip, inseam, shoulder_width, foot_length, length, thigh), then matches that vector against a brand's size chart entries which are defined in measurement ranges. This makes cross-brand translation tractable: all brands define their sizes in measurement ranges, so the measurement vector itself is the universal scale — no secondary normalization layer is needed.

**4.3.2 Data Hierarchy** (keep the 4-tier table, switch the priority and update the descriptions)
- Priority 1: User's own confirmed purchase history for this exact brand and product type
- Priority 2: Measurement approximation → run approximation model from height/weight/body_type → MeasurementVector → overlap score against target brand's size chart entries
- Priority 3: Community data — weighted vote from users within ±3cm height and ±3kg weight who purchased this exact product/SKU
- Priority 4: Known fit translation — user's self-reported KnownFit for the same category at another brand → compute the midpoint of each measurement range for that size at Brand A → use those midpoints as a pseudo-measurement vector → run overlap scoring against Brand B's size chart entries

**4.3.3 Body Metric Approximation**
The approximation model produces a MeasurementVector from height_cm, weight_kg, and body_type:
- Base predictions are statistical estimates: e.g., chest_cm ≈ f(height, weight), length_cm ≈ f(height)
- Body type applies a shape modifier: slim subtracts from chest/waist/hip/thigh; athletic/broad adds
- length_cm is predicted primarily from height and is category-agnostic at the model level — its semantic meaning (top length vs. pant length) is resolved at scoring time by the product category
- When the user provides exact body measurements, those override the predictions entirely
- When the user has confirmed KnownFits, the system can back-calibrate predictions toward ground truth over time

**4.3.4 Overlap Scoring**
For Priority 2 matching, the engine computes an overlap score for each SizeChartEntry:
- Overlap = how much of the user's predicted measurements fall within the entry's measurement ranges for the axes relevant to that product category
- Category-aware scoring axes:
  - Tops / T-shirts: chest_cm (primary), shoulder_width_cm (secondary), length_cm (tertiary)
  - Hoodies / Outerwear: chest_cm (primary), shoulder_width_cm (secondary), length_cm (tertiary)
  - Bottoms / Pants: waist_cm (primary), inseam_cm (secondary), length_cm (tertiary), thigh_cm (quaternary)
  - Shoes: foot_length_cm only (width is a future phase)
- Axes are weighted by priority order — primary axes contribute more to the overlap score than secondary or tertiary axes
- The size label with the highest weighted overlap score is recommended

**4.3.5 Known Fit Translation (Priority 4)**
When a user has a KnownFit at Brand A for the same category, the engine looks up the measurement ranges for that size label in Brand A's size chart, computes the midpoint of each relevant axis (e.g., midpoint of chest_min and chest_max, length_min and length_max), and uses those midpoints as a pseudo-measurement vector. It then runs the same overlap scoring used in Priority 2 against Brand B's size chart entries, respecting the same category-aware axis weighting. The size label with the highest overlap wins. This reuses the measurement ranges as the universal scale — no secondary normalization needed.

**4.3.6 Confidence Display**
No change from original PRD — still always display at full confidence in v1. Internally log which priority tier (1–4) was used per recommendation for analytics.

### Update Section 6 — Data Model

Replace the existing data model table with the structured entity definitions below. 
Present them as a clear table or structured list, consistent with the PRD's existing style.

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
- length_cm represents the garment's full vertical length; its semantic meaning is resolved at 
  scoring time by product category (top length vs. pant length)
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
- measurement_ranges: { chest_cm, waist_cm, hip_cm, inseam_cm, shoulder_width_cm, foot_length_cm, length_cm, thigh_cm }
  each as [min, max] — only relevant axes populated per product category

**NormalizedCategory** (enum referenced by multiple entities)
- tops, bottoms, outerwear, shoes

**Purchase**
- id, user_id, product_sku, brand_id, product_category, size_label, timestamp
- fit_status: pending | confirmed | corrected
- recommendation_tier_used: 1|2|3|4 (which priority level produced the recommendation)

**ScraperConfig**
- No change from original PRD

Also add a note in Section 5.1 (System Components) that the Approximation Model is a first-class backend component: it receives height_cm, weight_kg, body_type and returns a MeasurementVector. It is invoked at profile creation/update and its output is cached on the User record as predicted_measurements.

---

## TASK 2: Create `docs/backend_api_spec.md`

Create a new file. Write a clean backend API specification covering all endpoints needed 
for the recommendation pipeline. Use this structure for each endpoint:

### Authentication
All endpoints require Bearer token auth. Document this once at the top.

### Endpoints to specify:

**POST /auth/register** — Create new user account + trigger initial measurement prediction
**POST /auth/login** — Return auth token

**GET /users/me** — Return full user profile including predicted_measurements
**PATCH /users/me** — Update profile fields; if height/weight/body_type changes, 
  re-run approximation model and update predicted_measurements
**DELETE /users/me** — Full account + data deletion

**GET /recommend** 
- Query params: brand_id, product_category, product_sku
- Response: { recommended_size, recommendation_tier (1-4), social_proof_entries[] }
- social_proof_entries: [ { username_snippet, height_cm, weight_cm, size_purchased } ]
  only returned when 3+ qualifying entries exist and user has opted into social proof
- Document the priority tier evaluation logic in plain English within this endpoint's spec

**POST /purchase** — Log a completed purchase
- Body: { product_sku, brand_id, product_category, size_label }
- Side effect: creates Purchase record with fit_status: pending

**POST /purchase/:id/correct** — User flags a bad fit
- Body: { actual_size, fit_direction: "runs_large" | "runs_small" | "wrong_size" }
- Side effects: update fit_status to corrected, update KnownFit, flag for community data update

**GET /brands** — List all enabled brands with their supported product categories

**GET /brands/:id/size-chart** — Return full size chart for a brand
- Query params: gender_category, product_category

**Admin endpoints (prefix /admin, separate auth role):**
**POST /admin/brands** — Create brand
**PATCH /admin/brands/:id** — Update brand (including enable/disable)
**POST /admin/brands/:id/size-chart** — Upload/replace size chart entries for a category
**GET /admin/analytics** — Return key metrics (users, purchases, accuracy rate, tier distribution)

---