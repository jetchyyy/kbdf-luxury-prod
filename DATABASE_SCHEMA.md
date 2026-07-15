## Table `tenants`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `domain` | `text` |  Nullable |
| `logo_url` | `text` |  Nullable |
| `primary_color` | `text` |  Nullable |
| `accent_color` | `text` |  Nullable |
| `currency_symbol` | `text` |  Nullable |
| `timezone` | `text` |  Nullable |
| `store_settings` | `jsonb` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `reservation_duration_seconds` | `int4` |  |

## Table `roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `permissions` | `jsonb` |  |
| `is_system_role` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `admin_users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `auth_id` | `uuid` |  Unique |
| `tenant_id` | `uuid` |  Nullable |
| `role_id` | `uuid` |  Nullable |
| `email` | `text` |  |
| `full_name` | `text` |  |
| `avatar_url` | `text` |  Nullable |
| `is_superadmin` | `bool` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `access_overview` | `bool` |  Nullable |
| `access_analytics` | `bool` |  Nullable |
| `access_items` | `bool` |  Nullable |
| `access_users` | `bool` |  Nullable |
| `access_settings` | `bool` |  Nullable |
| `access_leads` | `bool` |  Nullable |
| `access_expenses` | `bool` |  Nullable |
| `access_categories` | `bool` |  Nullable |
| `access_roles` | `bool` |  Nullable |
| `access_payment_methods` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `access_orders` | `bool` |  Nullable |
| `access_promo_codes` | `bool` |  Nullable |
| `access_leeway` | `bool` |  Nullable |

## Table `categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `name` | `text` |  |
| `slug` | `text` |  |
| `description` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `sort_order` | `int4` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `category_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `slug` | `text` |  |
| `description` | `text` |  Nullable |
| `price` | `numeric` |  |
| `original_price` | `numeric` |  Nullable |
| `quantity` | `int4` |  |
| `sku` | `text` |  Nullable |
| `brand` | `text` |  Nullable |
| `condition` | `text` |  Nullable |
| `stock_status` | `text` |  Nullable |
| `image_urls` | `_text` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `sizes` | `jsonb` |  Nullable |
| `leeway_enabled` | `bool` |  Nullable |
| `leeway_down_payment_required` | `bool` |  Nullable |
| `leeway_down_payment_amount` | `numeric` |  Nullable |
| `weight` | `numeric` |  |
| `colors` | `jsonb` |  Nullable |
| `is_new_arrival` | `bool` |  Nullable |

## Table `leads`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `name` | `text` |  |
| `email` | `text` |  |
| `phone` | `text` |  Nullable |
| `subject` | `text` |  Nullable |
| `message` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `expense_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `name` | `text` |  |
| `color` | `text` |  Nullable |
| `is_predefined` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `expenses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `category_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `amount` | `numeric` |  |
| `date` | `date` |  |
| `description` | `text` |  Nullable |
| `receipt_url` | `text` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `payment_methods`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `name` | `text` |  |
| `type` | `text` |  Nullable |
| `account_name` | `text` |  Nullable |
| `account_number` | `text` |  Nullable |
| `qr_code_url` | `text` |  Nullable |
| `instructions` | `text` |  Nullable |
| `sort_order` | `int4` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `tracking_number` | `text` |  |
| `customer_first_name` | `text` |  |
| `customer_last_name` | `text` |  |
| `customer_email` | `text` |  |
| `customer_phone` | `text` |  |
| `customer_fb_link` | `text` |  Nullable |
| `shipping_province` | `text` |  |
| `shipping_city` | `text` |  |
| `shipping_barangay` | `text` |  |
| `shipping_street` | `text` |  |
| `shipping_landmark` | `text` |  Nullable |
| `delivery_method` | `text` |  |
| `payment_method_id` | `uuid` |  Nullable |
| `payment_method_type` | `text` |  |
| `proof_of_payment_url` | `text` |  Nullable |
| `subtotal` | `numeric` |  |
| `shipping_fee` | `numeric` |  |
| `total` | `numeric` |  |
| `status` | `text` |  |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `customer_id` | `uuid` |  Nullable |
| `promo_code_id` | `uuid` |  Nullable |
| `discount_amount` | `numeric` |  |
| `pickup_location` | `text` |  Nullable |

## Table `order_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `order_id` | `uuid` |  |
| `item_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `price` | `numeric` |  |
| `quantity` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |
| `size` | `text` |  Nullable |

## Table `promo_codes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `code` | `text` |  |
| `discount_type` | `text` |  |
| `discount_value` | `numeric` |  |
| `max_uses` | `int4` |  Nullable |
| `used_count` | `int4` |  |
| `expires_at` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `leeway_accounts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `customer_id` | `uuid` |  |
| `order_id` | `uuid` |  |
| `total_amount` | `numeric` |  |
| `down_payment_amount` | `numeric` |  |
| `remaining_balance` | `numeric` |  |
| `payment_schedule` | `text` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `leeway_payments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `leeway_account_id` | `uuid` |  |
| `amount` | `numeric` |  |
| `proof_of_payment_url` | `text` |  |
| `status` | `text` |  |
| `payment_type` | `text` |  |
| `admin_notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `leeway_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `customer_id` | `uuid` |  |
| `status` | `text` |  |
| `admin_notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `requested_items` | `jsonb` |  |
| `customer_name` | `text` |  Nullable |
| `customer_email` | `text` |  Nullable |

## Table `inventory_reservations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `item_id` | `uuid` |  |
| `size` | `text` |  Nullable |
| `quantity` | `int4` |  |
| `session_id` | `text` |  |
| `expires_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `product_reviews`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `item_id` | `uuid` |  |
| `author_name` | `text` |  |
| `rating` | `int4` |  |
| `content` | `text` |  Nullable |
| `images` | `_text` |  Nullable |
| `size` | `text` |  Nullable |
| `color` | `text` |  Nullable |
| `is_verified_buyer` | `bool` |  Nullable |
| `is_approved` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `user_favorites`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `item_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `customer_profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `first_name` | `text` |  Nullable |
| `last_name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `fb_link` | `text` |  Nullable |
| `province` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `barangay` | `text` |  Nullable |
| `street_address` | `text` |  Nullable |
| `landmark` | `text` |  Nullable |
| `custom_province` | `text` |  Nullable |
| `custom_city` | `text` |  Nullable |
| `custom_barangay` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

