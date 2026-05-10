-- ============================================================
-- Seed: Blocked Jurisdictions (India Online Gaming Rules 2026)
-- ============================================================
INSERT INTO blocked_jurisdictions (country_code, region_code, reason)
VALUES
  ('IN', 'IN-TG', 'India Online Gaming Rules 2026 — Telangana'),
  ('IN', 'IN-AP', 'India Online Gaming Rules 2026 — Andhra Pradesh')
ON CONFLICT (country_code, region_code) DO NOTHING;

-- ============================================================
-- Seed: Platform Config defaults
-- ============================================================
INSERT INTO platform_config (key, value) VALUES
  ('whatsapp_number',       '+919999999999'),
  ('exit_url',              'https://www.google.com'),
  ('ga4_measurement_id',    'G-XXXXXXXXXX'),
  ('ga4_api_secret',        ''),
  ('gsc_site_url',          'https://reddyexchgaming.com'),
  ('fallback_contact_phone',''),
  ('fallback_contact_email','support@reddyexchgaming.com')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Seed: Keyword Registry (30+ target keywords)
-- ============================================================
INSERT INTO keyword_registry (keyword, slug, tier, pillar_slug, synonyms) VALUES
  -- Primary (Pillar pages)
  ('online cricket id',  'online-cricket-id',  'primary', NULL,
   ARRAY['cricket id online', 'online cricket account', 'cricket ID banwao']),
  ('whatsapp cricket id','whatsapp-cricket-id', 'primary', NULL,
   ARRAY['cricket id whatsapp pe', 'whatsapp se cricket id', 'wa cricket id']),

  -- Secondary
  ('instant cricket id',  'instant-cricket-id',  'secondary', 'online-cricket-id',
   ARRAY['turant cricket id', 'jaldi cricket id']),
  ('cricket betting id',  'cricket-betting-id',  'secondary', 'online-cricket-id',
   ARRAY['cricket gaming id', 'cricket prediction id']),
  ('reddy anna book',     'reddy-anna-book',     'secondary', 'online-cricket-id',
   ARRAY['reddy anna', 'reddyanna book']),
  ('diamond exch',        'diamond-exch',        'secondary', 'online-cricket-id',
   ARRAY['diamond exchange', 'diamond exch id']),
  ('fairplay id',         'fairplay-id',         'secondary', 'online-cricket-id',
   ARRAY['fairplay gaming id', 'fairplay account']),
  ('lotus365 id',         'lotus365-id',         'secondary', 'online-cricket-id',
   ARRAY['lotus 365 id', 'lotus365 account']),
  ('mahadev book',        'mahadev-book',        'secondary', 'online-cricket-id',
   ARRAY['mahadev book id', 'mahadev gaming']),
  ('sky exchange id',     'sky-exchange-id',     'secondary', 'online-cricket-id',
   ARRAY['skyexch id', 'sky exch account']),
  ('betbhai9 id',         'betbhai9-id',         'secondary', 'online-cricket-id',
   ARRAY['betbhai 9 id', 'betbhai9 account']),
  ('world777 id',         'world777-id',         'secondary', 'online-cricket-id',
   ARRAY['world 777 id', 'world777 account']),
  ('tigerexch id',        'tigerexch-id',        'secondary', 'online-cricket-id',
   ARRAY['tiger exchange id', 'tigerexch account']),
  ('online gaming id india', 'online-gaming-id-india', 'secondary', 'online-cricket-id',
   ARRAY['india gaming id', 'gaming id india online']),

  -- Long-tail
  ('how to get cricket id via whatsapp', 'how-to-get-cricket-id-via-whatsapp', 'long_tail', 'whatsapp-cricket-id',
   ARRAY['whatsapp se cricket id kaise banaye', 'cricket id whatsapp number']),
  ('best ipl betting id india',          'best-ipl-betting-id-india',          'long_tail', 'online-cricket-id',
   ARRAY['ipl gaming id india', 'best ipl prediction id']),
  ('cricket id kaise banaye',            'cricket-id-kaise-banaye',            'long_tail', 'online-cricket-id',
   ARRAY['cricket id banana', 'cricket account kaise banaye']),
  ('online cricket id free',             'online-cricket-id-free',             'long_tail', 'online-cricket-id',
   ARRAY['free cricket id', 'cricket id without deposit']),
  ('cricket id whatsapp number india',   'cricket-id-whatsapp-number-india',   'long_tail', 'whatsapp-cricket-id',
   ARRAY['india cricket id whatsapp', 'cricket id contact number']),
  ('instant cricket id whatsapp',        'instant-cricket-id-whatsapp',        'long_tail', 'whatsapp-cricket-id',
   ARRAY['turant cricket id whatsapp pe', 'quick cricket id whatsapp']),
  ('trusted cricket id provider india',  'trusted-cricket-id-provider-india',  'long_tail', 'online-cricket-id',
   ARRAY['reliable cricket id india', 'safe cricket id provider']),
  ('cricket id 5 minutes',               'cricket-id-5-minutes',               'long_tail', 'whatsapp-cricket-id',
   ARRAY['5 minute cricket id', 'cricket id jaldi milega']),
  ('ipl 2025 cricket id',                'ipl-2025-cricket-id',                'long_tail', 'online-cricket-id',
   ARRAY['ipl 2025 gaming id', 'ipl season cricket id']),
  ('t20 world cup cricket id',           't20-world-cup-cricket-id',           'long_tail', 'online-cricket-id',
   ARRAY['t20 wc gaming id', 'world cup cricket account']),
  ('online sports prediction id india',  'online-sports-prediction-id-india',  'long_tail', 'online-cricket-id',
   ARRAY['sports prediction id', 'fantasy sports id india']),
  ('fantasy cricket id india',           'fantasy-cricket-id-india',           'long_tail', 'online-cricket-id',
   ARRAY['fantasy cricket account', 'fantasy id india']),
  ('cricket id registration online',     'cricket-id-registration-online',     'long_tail', 'online-cricket-id',
   ARRAY['cricket id register', 'cricket account registration']),
  ('new cricket id 2025',                'new-cricket-id-2025',                'long_tail', 'online-cricket-id',
   ARRAY['2025 cricket id', 'latest cricket id']),
  ('reddyexch cricket id',               'reddyexch-cricket-id',               'long_tail', 'online-cricket-id',
   ARRAY['reddy exch id', 'reddyexch gaming id']),
  ('whatsapp se gaming id kaise le',     'whatsapp-se-gaming-id-kaise-le',     'long_tail', 'whatsapp-cricket-id',
   ARRAY['gaming id whatsapp se lena', 'whatsapp gaming id india'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed: Default Widget Configs
-- ============================================================
INSERT INTO widget_configs (widget_type, config, is_active) VALUES
  ('crictime',    '{"matchTypes": ["IPL", "T20I", "ODI", "Test"], "teams": [], "tournaments": []}', true),
  ('instagram',   '{"hashtags": ["cricketid", "reddyexch"], "accountHandles": [], "postCount": 6}', true),
  ('whatsapp_ab', '{"variantA": {"buttonText": "Get Cricket ID Now", "activationLabel": "Get your ID in 5 minutes", "prefilledMessage": "Hi, I want to get my Gaming ID"}, "variantB": {"buttonText": "WhatsApp Us Instantly", "activationLabel": "Instant ID activation", "prefilledMessage": "Hi, I need a Cricket Gaming ID"}, "splitPercentage": 50, "winner": null}', true)
ON CONFLICT DO NOTHING;
