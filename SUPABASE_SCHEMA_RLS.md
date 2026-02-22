# Supabase tablolar ve RLS (kontrol listesi)

Aşağıdaki tablolar ve kolonlar uygulama tarafından kullanılıyor. Supabase Dashboard → Table Editor / SQL ile oluşturup RLS politikalarını ekleyin.

---

## 1. `invitations`

Davetiyeler (düğün sahibi oluşturur).

| Kolon | Tip | Not |
|-------|-----|-----|
| id | uuid | PRIMARY KEY, default gen_random_uuid() |
| owner_id | uuid | NOT NULL, auth.users(id) ile eşleşmeli |
| slug | text | UNIQUE, NOT NULL (örn. ayse-mehmet-123456) |
| title | text | NOT NULL |
| host_names | text | nullable |
| date_iso | text | nullable (ISO tarih/saat) |
| location | text | nullable |
| hero_image_url | text | nullable |
| language | text | default 'tr' |
| template_id | text | nullable |
| theme_id | text | default 'elegant' |
| is_published | boolean | default true |
| require_token | boolean | default false |
| default_token | text | nullable |
| theme_config | jsonb | default '{}' |
| current_uses | integer | default 0, nullable |
| expires_at | timestamptz | nullable |
| max_uses | integer | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**RLS önerisi:**
- SELECT: `is_published = true` (herkes) VEYA `owner_id = auth.uid()` (sahip)
- INSERT: `owner_id = auth.uid()`
- UPDATE/DELETE: `owner_id = auth.uid()`

---

## 2. `rsvps`

Davetli yanıtları.

| Kolon | Tip | Not |
|-------|-----|-----|
| id | uuid | PRIMARY KEY |
| invitation_id | uuid | NOT NULL, REFERENCES invitations(id) ON DELETE CASCADE |
| full_name | text | NOT NULL |
| email | text | nullable |
| phone | text | nullable |
| attendance | text | NOT NULL ('yes' | 'no' | 'maybe') |
| guests_count | integer | default 1 |
| note | text | nullable |
| selected_events | text[] | nullable (etkinlik adları) |
| created_at | timestamptz | default now() |

**RLS önerisi:**
- SELECT: invitation sahibi `invitations.owner_id = auth.uid()` VEYA davetiye public ise sadece kendi invitation_id için (genelde sadece sahip görsün)
- INSERT: Herkes (public RSVP endpoint); invitation'ın is_published olması API'de kontrol ediliyor. RLS'te: `EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND is_published = true)` ile kısıtlayabilirsiniz.
- UPDATE/DELETE: Sadece invitation sahibi.

---

## 3. `purchases`

Satın almalar (abonelik/plan).

| Kolon | Tip | Not |
|-------|-----|-----|
| id | uuid | PRIMARY KEY |
| user_id | uuid | NOT NULL, auth.users(id) |
| plan_type | text | 'light' | 'premium' vb. |
| amount | numeric | nullable |
| status | text | NOT NULL ('pending' | 'completed' | 'cancelled') |
| purchased_at | timestamptz | default now() |
| expires_at | timestamptz | nullable |

**RLS önerisi:**
- SELECT: `user_id = auth.uid()` (kullanıcı kendi kayıtlarını görsün)
- INSERT: `user_id = auth.uid()` (sadece kendi adına)
- UPDATE: Genelde service role ile yapılır (ödeme callback). RLS'te kullanıcı sadece kendi satırını görebilir; güncelleme admin/backend.

---

## 4. `guest_questions`

Davetiye başına özel sorular.

| Kolon | Tip | Not |
|-------|-----|-----|
| id | uuid | PRIMARY KEY |
| invitation_id | uuid | NOT NULL, REFERENCES invitations(id) ON DELETE CASCADE |
| question | text | NOT NULL |
| order_index | integer | default 0 |

**RLS önerisi:**
- SELECT: Herkes (davetiye sayfasında sorular listelenir) VEYA invitation sahibi. Public davetiye için: `EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND is_published = true)`.
- INSERT/UPDATE/DELETE: `EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND owner_id = auth.uid())`.

---

## 5. `guest_answers`

Misafir soru cevapları (RSVP ile birlikte).

| Kolon | Tip | Not |
|-------|-----|-----|
| id | uuid | PRIMARY KEY |
| rsvp_id | uuid | NOT NULL, REFERENCES rsvps(id) ON DELETE CASCADE |
| invitation_id | uuid | NOT NULL (denormalize, RLS kolaylığı) |
| question_id | uuid | NOT NULL |
| answer | text | NOT NULL |

**RLS önerisi:**
- SELECT: Invitation sahibi.
- INSERT: Herkes (RSVP API); invitation'ın is_published ve geçerli rsvp kontrolü API'de.

---

## 6. `love_notes`

Gelin/damada mesajlar.

| Kolon | Tip | Not |
|-------|-----|-----|
| id | uuid | PRIMARY KEY |
| invitation_id | uuid | NOT NULL |
| guest_name | text | NOT NULL |
| guest_email | text | nullable |
| message | text | NOT NULL |
| created_at | timestamptz | default now() |

**RLS:** SELECT invitation sahibi; INSERT herkes (public endpoint, API davetiye kontrolü yapar).

---

## 7. `invitation_guests`

Token tabanlı davetli takibi (şu an tek link kullanılıyor; tablo kalabilir).

| Kolon | Tip | Not |
|-------|-----|-----|
| id | uuid | PRIMARY KEY |
| invitation_id | uuid | NOT NULL |
| token | text | NOT NULL, UNIQUE |
| status | text | 'pending' | 'opened' | 'responded' |
| guest_name | text | nullable |
| guest_email | text | nullable |
| opened_at | timestamptz | nullable |
| responded_at | timestamptz | nullable |
| created_at | timestamptz | default now() |

**RLS:** SELECT/INSERT/UPDATE invitation sahibi; public API token ile sadece ilgili satırı günceller (service role veya özel politika).

---

## 8. Testimonials (varsa)

Eğer `testimonials` tablosu kullanılıyorsa: invitation_id, author, message, created_at vb. RLS: invitation sahibi yönetir, public davetiye sayfasında SELECT serbest.

---

## Hızlı kontrol

1. **Dashboard → Table Editor:** Yukarıdaki tablolar var mı?
2. **Authentication → Providers:** Email (ve isterseniz diğerleri) açık mı?
3. **RLS:** Her tabloda RLS enabled; yukarıdaki kurallar ekli mi?
4. **API Health:** `node scripts/check-setup.js --health` veya tarayıcıda `http://localhost:4173/api/health` → `database: "connected"` dönmeli.

Sorun olursa: Supabase Logs (API/Postgres) ve tarayıcı Network sekmesinden hata mesajına bakın.
