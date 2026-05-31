-- Iron Asylum seed (run after migrations)
insert into gyms (id, slug, name, tagline, phone, email, address_line1, city, state, zip)
values (
  'a0000000-0000-4000-8000-000000000001',
  'iron-asylum',
  'Iron Asylum',
  'Hardcore training. Real community. Longview, TX.',
  '(903) 555-0199',
  'info@ironasylumgym.example',
  '1200 Industrial Blvd',
  'Longview',
  'TX',
  '75601'
) on conflict (slug) do nothing;

insert into gym_branding (gym_id, theme, labels, feature_flags, images, nav, business)
values (
  'a0000000-0000-4000-8000-000000000001',
  '{"primary":"#dc2626","primaryForeground":"#ffffff","accent":"#f59e0b","accentForeground":"#0a0a0a","background":"#0a0a0a","surface":"#141414","surfaceBorder":"#262626","muted":"#a3a3a3","danger":"#ef4444"}'::jsonb,
  '{"prSubmit":"Log PR","leaderboard":"Leaderboards","competitions":"Competitions","feed":"Gym Feed","dashboard":"My Dashboard","admin":"Staff Portal","profile":"My Profile","account":"Account"}'::jsonb,
  '{"socialFeed":true,"competitions":true,"achievements":true,"prModeration":true,"leaderboards":true}'::jsonb,
  '{"hero":"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80","gallery":["https://images.unsplash.com/photo-1583454110551-21f2ffc2a61d?w=800&q=80","https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80","https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"]}'::jsonb,
  '{}'::jsonb,
  '{"hours":[{"day":"Mon–Fri","open":"5:00 AM","close":"10:00 PM"},{"day":"Saturday","open":"6:00 AM","close":"8:00 PM"},{"day":"Sunday","open":"8:00 AM","close":"6:00 PM"}],"membershipBlurb":"No contracts. No fluff. Day passes, monthly memberships, and annual options for committed lifters.","contactEmail":"info@ironasylumgym.example","contactPhone":"(903) 555-0199","address":{"line1":"1200 Industrial Blvd","city":"Longview","state":"TX","zip":"75601"}}'::jsonb
) on conflict (gym_id) do nothing;

insert into gym_pages (id, gym_id, slug, title, is_published)
values (
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'home',
  'Home',
  true
) on conflict (gym_id, slug) do nothing;

insert into gym_page_sections (page_id, section_key, section_type, sort_order, enabled, props)
values
  ('b0000000-0000-4000-8000-000000000001', 'hero', 'hero', 1, true,
   '{"headline":"Train Like You Mean It","subheadline":"PR boards, competitions, and a community that pushes you — built for Iron Asylum members.","ctaLabel":"Join the Asylum","ctaHref":"/sign-up","secondaryCtaLabel":"View Leaderboards","secondaryCtaHref":"/leaderboards"}'::jsonb),
  ('b0000000-0000-4000-8000-000000000001', 'cta', 'cta', 2, true,
   '{"title":"Log PRs. Climb Boards. Win Challenges.","body":"Submit machine and lift PRs, react to wins, and compete in monthly gym challenges."}'::jsonb),
  ('b0000000-0000-4000-8000-000000000001', 'hours', 'hours', 3, true,
   '{"title":"Gym Hours"}'::jsonb),
  ('b0000000-0000-4000-8000-000000000001', 'location', 'location', 4, true,
   '{"title":"Find Us in Longview"}'::jsonb),
  ('b0000000-0000-4000-8000-000000000001', 'membership', 'membership', 5, true,
   '{"title":"Membership","ctaLabel":"View pricing","ctaHref":"/pricing"}'::jsonb),
  ('b0000000-0000-4000-8000-000000000001', 'gallery', 'gallery', 6, true,
   '{"title":"On the Floor"}'::jsonb),
  ('b0000000-0000-4000-8000-000000000001', 'announcements', 'announcements', 7, true,
   '{"title":"Announcements","items":["March PR Board Challenge — top 3 per division win merch.","Saturday open gym meet prep — sign up in Competitions."]}'::jsonb)
on conflict (page_id, section_key) do nothing;

insert into gym_pages (id, gym_id, slug, title, is_published, settings)
values
  (
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'contact',
    'Contact',
    true,
    '{"headline":"Contact Iron Asylum","subtitle":"Questions about membership, coaching, or your first visit? Send a message or use the details below.","formHeadline":"Send a message","formSubtitle":"We reply by email. Your message is also saved in the gym inbox for staff.","showForm":true,"showDirectionsLink":true,"faqItems":[{"question":"Do you offer day passes?","answer":"Yes — see our pricing page for drop-in and membership options."},{"question":"Can I tour the gym first?","answer":"Absolutely. Use the form to request a visit and we will follow up with available times."}]}'::jsonb
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000001',
    'pricing',
    'Pricing',
    true,
    '{"headline":"Membership & pricing","subtitle":"Straightforward options for day visitors, monthly members, and committed lifters. No hidden fees.","footnote":"Prices may vary for corporate or student discounts. Ask at the front desk or contact us before you sign up."}'::jsonb
  )
on conflict (gym_id, slug) do nothing;

insert into gym_pricing_plans (
  gym_id,
  sort_order,
  enabled,
  name,
  tagline,
  description,
  price_display,
  price_cents,
  compare_at_display,
  billing_interval,
  duration_label,
  features,
  image_url,
  badge,
  is_featured,
  cta_label,
  cta_href
)
values
  (
    'a0000000-0000-4000-8000-000000000001',
    1,
    true,
    'Day pass',
    'Try the floor for a day',
    'Full access to machines, free weights, and cardio for one visit.',
    '$15',
    1500,
    '',
    'one_time',
    'Single visit',
    array['One full day of access', 'No contract', 'Great for travelers'],
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
    '',
    false,
    'Visit today',
    '/contact'
  ),
  (
    'a0000000-0000-4000-8000-000000000001',
    2,
    true,
    'Monthly',
    'Train on your schedule',
    'Unlimited access with month-to-month flexibility.',
    '$59/mo',
    5900,
    '',
    'month',
    'Billed monthly',
    array['Unlimited gym access', 'PR boards & competitions', 'Member community feed'],
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    'Most popular',
    true,
    'Join now',
    '/sign-up'
  ),
  (
    'a0000000-0000-4000-8000-000000000001',
    3,
    true,
    'Annual',
    'Best value for regulars',
    'Twelve months of access for lifters who know this is their home gym.',
    '$599/yr',
    59900,
    '$708',
    'year',
    '12-month commitment',
    array['Everything in Monthly', 'Priority event sign-ups', 'Annual merch credit'],
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    'Best value',
    false,
    'Commit & save',
    '/sign-up'
  )
on conflict do nothing;

insert into machines (gym_id, name, slug, category) values
  ('a0000000-0000-4000-8000-000000000001', 'Hammer Strength Leg Press', 'leg-press', 'legs'),
  ('a0000000-0000-4000-8000-000000000001', 'Hack Squat', 'hack-squat', 'legs')
on conflict do nothing;

insert into lifts (gym_id, name, slug, category) values
  ('a0000000-0000-4000-8000-000000000001', 'Back Squat', 'back-squat', 'powerlifting'),
  ('a0000000-0000-4000-8000-000000000001', 'Bench Press', 'bench-press', 'powerlifting'),
  ('a0000000-0000-4000-8000-000000000001', 'Deadlift', 'deadlift', 'powerlifting')
on conflict do nothing;

insert into badges (gym_id, code, name, description) values
  ('a0000000-0000-4000-8000-000000000001', 'first_pr', 'First PR', 'Logged your first personal record'),
  ('a0000000-0000-4000-8000-000000000001', 'top_10', 'Board Crusher', 'Reached top 10 on a leaderboard')
on conflict do nothing;

insert into competitions (gym_id, title, slug, description, status, starts_at, ends_at, rules_summary, scoring_method)
values (
  'a0000000-0000-4000-8000-000000000001',
  'March PR Board Challenge',
  'march-pr-board',
  'Top PRs on selected machines win merch.',
  'open',
  now(),
  now() + interval '14 days',
  'Best single on leg press or hack squat.',
  'best_single'
) on conflict do nothing;
