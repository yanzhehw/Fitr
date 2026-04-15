# Fitr Backend API Specification

Version 1.0 | April 2026

Base URL: `http://localhost:3001` (development)

---

## Authentication

All endpoints except `POST /auth/register` and `POST /auth/login` require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Unauthenticated requests receive `401 Unauthorized`.

---

## Auth

### POST /auth/register

Create a new user account. Triggers initial measurement prediction via the Approximation Model.

**Request Body:**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| username | string | yes | Min 3 characters. Must be unique. |
| height_cm | number | yes | Positive. Stored in cm. |
| weight_kg | number | yes | Positive. Stored in kg. |
| body_type | string | yes | Gender-dependent enum (see User entity). |
| gender_category | string | yes | `mens` \| `womens` \| `unisex` |
| social_proof_opt_in | boolean | no | Defaults `false`. |
| known_fits | KnownFitDraft[] | no | Optional initial known fits. |
| exact_measurements | MeasurementVector | no | Optional user-provided measurements. |

**Response:** `201 Created`

```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "height_cm": 180,
    "weight_kg": 75,
    "body_type": "rectangle",
    "gender_category": "mens",
    "predicted_measurements": { "chest_cm": 98.5, "waist_cm": 82.0, ... },
    "exact_measurements": null,
    "measurement_confidence": "low",
    "social_proof_opt_in": false,
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  },
  "token": "string"
}
```

**Side effects:**
- Runs Approximation Model to compute `predicted_measurements` from height/weight/body_type
- Caches result on the User record
- Creates any provided KnownFit entries

**Errors:** `409 Conflict` if username taken. `400 Bad Request` for validation failures.

---

### POST /auth/login

Authenticate and return an auth token.

**Request Body:**

| Field | Type | Required |
| :---- | :---- | :---- |
| username | string | yes |

**Response:** `200 OK`

```json
{
  "user": { ... },
  "token": "string"
}
```

**Errors:** `404 Not Found` if user does not exist.

---

## User Profile

### GET /users/me

Return the authenticated user's full profile including predicted and exact measurements.

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "username": "string",
  "height_cm": 180,
  "weight_kg": 75,
  "body_type": "rectangle",
  "gender_category": "mens",
  "predicted_measurements": {
    "chest_cm": 98.5,
    "waist_cm": 82.0,
    "hip_cm": 95.0,
    "inseam_cm": 81.0,
    "shoulder_width_cm": 45.0,
    "foot_length_cm": 27.5,
    "length_cm": 72.0,
    "thigh_cm": 55.0
  },
  "exact_measurements": null,
  "measurement_confidence": "low",
  "social_proof_opt_in": false,
  "known_fits": [
    { "id": "uuid", "brand_id": "uuid", "product_category": "tops", "size_label": "M", "source": "self_reported" }
  ],
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

### PATCH /users/me

Update profile fields. If `height_cm`, `weight_kg`, or `body_type` changes, the Approximation Model is re-run and `predicted_measurements` is updated.

**Request Body:** Any subset of:

| Field | Type | Notes |
| :---- | :---- | :---- |
| username | string | Min 3 characters. |
| height_cm | number | Positive. |
| weight_kg | number | Positive. |
| body_type | string | Gender-dependent enum. |
| gender_category | string | `mens` \| `womens` \| `unisex` |
| social_proof_opt_in | boolean | |
| exact_measurements | MeasurementVector \| null | Set to `null` to clear. |

**Response:** `200 OK` — returns the updated user profile (same shape as `GET /users/me`).

**Side effects:**
- If height_cm, weight_kg, or body_type changed → re-run Approximation Model → update `predicted_measurements`
- If gender_category changed → body_type enum set changes; may require body_type update too

**Errors:** `409 Conflict` if new username is taken. `400 Bad Request` for validation failures.

---

### DELETE /users/me

Full account and data deletion. Cascades to all associated records.

**Response:** `204 No Content`

**Side effects:** Deletes User + KnownFits + Purchases + Corrections + consent records.

---

## Recommendations

### GET /recommend

Get a size recommendation for a specific product.

**Query Parameters:**

| Param | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| brand_id | uuid | yes | Target brand. |
| product_category | string | yes | `tops` \| `bottoms` \| `outerwear` \| `shoes` |
| product_sku | string | yes | Exact product SKU for social proof matching. |

**Response:** `200 OK`

```json
{
  "recommended_size": "M",
  "recommendation_tier": 2,
  "brand_name": "Nike",
  "product_category": "tops",
  "social_proof_entries": [
    { "username_snippet": "Yan***", "height_cm": 180, "weight_kg": 75, "size_purchased": "M" },
    { "username_snippet": "Ale***", "height_cm": 178, "weight_kg": 73, "size_purchased": "M" },
    { "username_snippet": "Sam***", "height_cm": 182, "weight_kg": 77, "size_purchased": "L" }
  ]
}
```

**Priority tier evaluation logic:**

1. **Tier 1 — Own purchase history:** Check if the user has a confirmed purchase for this exact brand + product category. If found, return that size.
2. **Tier 2 — Measurement approximation:** Run the user's MeasurementVector (predicted or exact) through overlap scoring against the target brand's size chart entries for this product category. Category-aware axis weighting applies (e.g., tops weight chest > shoulder > length). Return the size label with the highest weighted overlap score.
3. **Tier 3 — Community data:** Find users within ±3cm height and ±3kg weight who purchased this exact product/SKU with confirmed fit. If 3+ qualifying entries exist, return the weighted majority size.
4. **Tier 4 — Known fit translation:** If the user has a KnownFit for the same product category at a different brand, look up that size's measurement ranges in Brand A's chart, compute midpoints as a pseudo-measurement vector, and run overlap scoring against Brand B's chart. Return the highest-overlap size.

The engine evaluates tiers in order (1 → 2 → 3 → 4) and returns the first tier that produces a result.

**Social proof rules:**
- `social_proof_entries` is only populated when 3+ qualifying entries exist for this product/SKU (k-anonymity)
- Only includes data from users who have `social_proof_opt_in = true`
- Usernames truncated to first 3 chars + `***`
- Empty array if conditions not met

---

## Purchases

### POST /purchase

Log a completed purchase.

**Request Body:**

| Field | Type | Required |
| :---- | :---- | :---- |
| product_sku | string | yes |
| brand_id | uuid | yes |
| product_category | string | yes |
| size_label | string | yes |

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "product_sku": "NK-DRI-FIT-001",
  "brand_id": "uuid",
  "product_category": "tops",
  "size_label": "M",
  "fit_status": "pending",
  "recommendation_tier_used": 2,
  "purchased_at": "ISO8601"
}
```

**Side effects:**
- Creates Purchase record with `fit_status: pending`
- Records which recommendation tier was active when the user made this purchase

---

### POST /purchase/:id/correct

User flags a purchase as a bad fit.

**URL Parameters:** `id` — Purchase UUID

**Request Body:**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| actual_size | string | no | The correct size (if known). At least one of actual_size or fit_direction required. |
| fit_direction | string | no | `runs_large` \| `runs_small` \| `wrong_size` |

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "purchase_id": "uuid",
  "actual_size": "S",
  "fit_direction": "runs_large",
  "created_at": "ISO8601"
}
```

**Side effects:**
- Updates Purchase `fit_status` to `corrected`
- Creates/updates a KnownFit entry if `actual_size` is provided (source: `corrected`)
- Flags the product for community data recalculation

**Errors:** `404 Not Found` if purchase doesn't exist or doesn't belong to the user.

---

## Brands

### GET /brands

List all enabled brands with their supported product categories.

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "Nike",
    "region": "NA",
    "product_categories": ["tops", "bottoms", "outerwear", "shoes"]
  },
  {
    "id": "uuid",
    "name": "adidas",
    "region": "NA",
    "product_categories": ["tops", "bottoms", "outerwear", "shoes"]
  }
]
```

---

### GET /brands/:id/size-chart

Return the full size chart for a brand, filtered by gender and product category.

**URL Parameters:** `id` — Brand UUID

**Query Parameters:**

| Param | Type | Required |
| :---- | :---- | :---- |
| gender_category | string | yes |
| product_category | string | yes |

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "brand_id": "uuid",
  "gender_category": "mens",
  "product_category": "tops",
  "entries": [
    {
      "id": "uuid",
      "size_label": "S",
      "measurement_ranges": {
        "chest_cm": [88, 96],
        "shoulder_width_cm": [42, 44],
        "length_cm": [68, 71]
      }
    },
    {
      "id": "uuid",
      "size_label": "M",
      "measurement_ranges": {
        "chest_cm": [96, 104],
        "shoulder_width_cm": [44, 46],
        "length_cm": [71, 74]
      }
    }
  ]
}
```

---

## Admin Endpoints

All admin endpoints require a separate admin auth role. Prefix: `/admin`.

### POST /admin/brands

Create a new brand.

**Request Body:**

| Field | Type | Required |
| :---- | :---- | :---- |
| name | string | yes |
| region | string | no |

**Response:** `201 Created` — returns the Brand object.

---

### PATCH /admin/brands/:id

Update a brand (including enable/disable).

**Request Body:** Any subset of:

| Field | Type |
| :---- | :---- |
| name | string |
| enabled | boolean |
| region | string |

**Response:** `200 OK` — returns the updated Brand object.

---

### POST /admin/brands/:id/size-chart

Upload or replace size chart entries for a brand + gender + product category combination.

**Request Body:**

| Field | Type | Required |
| :---- | :---- | :---- |
| gender_category | string | yes |
| product_category | string | yes |
| entries | SizeChartEntry[] | yes |

Each entry in `entries`:

| Field | Type | Required |
| :---- | :---- | :---- |
| size_label | string | yes |
| measurement_ranges | object | yes |

`measurement_ranges` keys: `chest_cm`, `waist_cm`, `hip_cm`, `inseam_cm`, `shoulder_width_cm`, `foot_length_cm`, `length_cm`, `thigh_cm` — each as `[min, max]`. Only relevant axes for the product category need to be provided.

**Response:** `201 Created`

**Side effects:** Replaces all existing entries for this brand + gender + category combination.

---

### GET /admin/analytics

Return key system metrics.

**Response:** `200 OK`

```json
{
  "total_users": 1250,
  "total_purchases": 3800,
  "accuracy_rate": 0.87,
  "tier_distribution": {
    "1": 420,
    "2": 2100,
    "3": 890,
    "4": 390
  },
  "top_brands": [
    { "brand_id": "uuid", "brand_name": "Nike", "purchase_count": 1800 }
  ],
  "top_categories": [
    { "product_category": "tops", "purchase_count": 1500 }
  ]
}
```

---

## Common Error Responses

All errors follow a consistent shape:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Human-readable description",
  "details": {}
}
```

| Status | Code | When |
| :---- | :---- | :---- |
| 400 | VALIDATION_ERROR | Request body/params fail Zod validation |
| 401 | UNAUTHORIZED | Missing or invalid Bearer token |
| 403 | FORBIDDEN | Non-admin accessing /admin endpoints |
| 404 | NOT_FOUND | Resource does not exist |
| 409 | CONFLICT | Unique constraint violation (e.g., username) |
| 500 | INTERNAL_ERROR | Unexpected server error |
