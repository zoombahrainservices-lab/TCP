-- Add chunks column to chapters table for structured, bite-sized content delivery
ALTER TABLE chapters ADD COLUMN chunks JSONB DEFAULT NULL;

-- Update Day 1 with chunked content
-- Split the Foundation chapter into 15 logical chunks (30-60 seconds each)
UPDATE chapters SET chunks = '[
  {
    "id": 1,
    "title": "The Moment Everything Changed",
    "body": [
      "Tom stood in the auditorium doorway, phone glowing, thumb scrolling through TikTok. Applause for another speaker leaked through the doors—a sound he used to live for, now just background noise.",
      "\"Tom Hammond? Is Tom here tonight?\"",
      "His mom grabbed his arm. \"Tom! They''re calling you!\"",
      "He shrugged her off. \"Just one more video.\"",
      "By the time his dad grabbed the phone, the organizers had moved on. Tom, fourteen, had just missed his slot at regionals—the same competition where he''d won first place eighteen months ago.",
      "His mom''s face: pure disappointment."
    ]
  },
  {
    "id": 2,
    "title": "The Rise",
    "body": [
      "Rewind three years. Tom was different.",
      "At eleven, this sixth-grader could hold 200 people captive with just his voice. While friends ground Fortnite after school, Tom practiced speeches for two hours in front of his mirror.",
      "By seventh grade, Tom was that kid—the one who MCed assemblies, the one everyone''s parents wanted at gatherings. After winning regionals at twelve, his debate coach said: \"You''re going to do something big someday.\"",
      "Tom believed him."
    ]
  },
  {
    "id": 3,
    "title": "What Actually Happened",
    "body": [
      "Here''s what nobody tells you: what happened to Tom is happening to everyone your age. And it''s not your fault.",
      "Dr. Anna Lembke (legit psychiatrist) wrote Dopamine Nation explaining how TikTok, Instagram, and YouTube hijack your brain. Every scroll gives you dopamine—the same chemical released when you eat your favorite food or get a text from your crush.",
      "Stanford tracked 2,500 teenagers for three years. Those spending 3+ hours daily on entertainment apps showed a 60% drop in passion activities. Brain scans revealed reduced activity in the prefrontal cortex—the part handling delayed gratification."
    ]
  },
  {
    "id": 4,
    "title": "The Science Behind It",
    "body": [
      "Tom''s brain: Stage performances released dopamine naturally, but required work. TikTok? Instant dopamine every 15 seconds.",
      "Reality check: Average teenager gets 237 notifications daily. Takes just 66 days to rewire neural pathways.",
      "You''re not weak. You''re being gamed by billion-dollar algorithms. The game is rigged.",
      "But you can still win."
    ]
  },
  {
    "id": 5,
    "title": "The SPARK Framework",
    "body": [
      "Tom used a system called SPARK—five steps that actually work:",
      "S - SURFACE the Pattern",
      "P - PINPOINT the Why",
      "A - ANCHOR to Identity",
      "R - REBUILD with Micro-Commitments",
      "K - KINDLE Community"
    ]
  },
  {
    "id": 6,
    "title": "S - Surface the Pattern",
    "body": [
      "Tom tracked phone usage for one week: 6.5 hours daily. That''s 195 hours monthly on his phone vs. 2 hours practicing. \"Almost 200 hours scrolling. Two hours on what I care about. That''s not who I want to be.\"",
      "YOUR TURN: Settings → Screen Time (iPhone) or Digital Wellbeing (Android). Look at your daily average. Don''t judge. Just look."
    ]
  },
  {
    "id": 7,
    "title": "P - Pinpoint the Why",
    "body": [
      "Tom''s dad asked: \"Why''d you stop caring about speaking?\"",
      "After silence: \"What if I''m not actually that good? What if I disappoint everyone? At least on my phone, I don''t have to find out.\"",
      "The phone was escape from performance anxiety.",
      "YOUR TURN: \"When I reach for my phone, I''m usually avoiding feeling...\""
    ]
  },
  {
    "id": 8,
    "title": "A - Anchor to Identity",
    "body": [
      "Stanford research: Identity-based motivation is 3x more effective than goals.",
      "Tom wrote: \"I am a storyteller who makes people feel less alone.\"",
      "Not \"I want to be.\" \"I AM.\"",
      "Stuck it on his mirror. Read it every morning. Sounds corny. Worked.",
      "YOUR TURN: \"I am a [identity] who [impact].\" Write it somewhere visible."
    ]
  },
  {
    "id": 9,
    "title": "R - Rebuild with Micro-Commitments",
    "body": [
      "Tom started with five minutes, three times that week. That''s it.",
      "Week 1: 5 minutes, 3 days",
      "Week 2: 10 minutes, 4 days",
      "Week 3: Watch open mic (don''t perform)",
      "Week 4: One story at family dinner",
      "Stanford found \"tiny habits\" are 400% more likely to stick than big goals."
    ]
  },
  {
    "id": 10,
    "title": "Day 23 — He Almost Quit",
    "body": [
      "Terrible day. Failed math test. Fight with his best friend.",
      "Came home exhausted.",
      "Phone right there. Just one video.",
      "Unlocked it. YouTube loaded. Finger hovering.",
      "Then—his lock screen. Photo of himself at eleven, mid-speech, lit up.",
      "He closed YouTube. Voice-recorded a story about his day.",
      "Added link #24 to his paper chain.",
      "Almost relapsing ≠ relapsing.",
      "YOUR TURN: Pick ONE thing. 5-10 minutes max. Three times this week."
    ]
  },
  {
    "id": 11,
    "title": "K - Kindle Community",
    "body": [
      "Tom reconnected with debate team. Asked his cousin Alex to be his accountability partner. Started attending open mics. Being around people who cared reminded his brain why this mattered.",
      "YOUR TURN: Text ONE person right now. Tell them what you''re working on. Ask for weekly check-ins."
    ]
  },
  {
    "id": 12,
    "title": "The Techniques: Substitution & Later",
    "body": [
      "#1: Substitution Game",
      "Tom''s three moves when reaching for his phone:",
      "1. Read one page from a great speech (pocket copy)",
      "2. Do 20 push-ups (disrupts mental loops)",
      "3. Voice-memo a story idea",
      "Key: Easier than unlocking his phone.",
      "YOUR TURN: Pick three easy alternatives. Write them in notes app now.",
      "#2: The \"Later\" Technique",
      "Not \"I won''t watch TikTok.\" Instead: \"I can watch after dinner, but right now I''m choosing to practice.\"",
      "Brain doesn''t feel deprived with \"later.\""
    ]
  },
  {
    "id": 13,
    "title": "The Techniques: Environment & Progress",
    "body": [
      "#3: Change Your Environment",
      "Tom''s phone charged in the kitchen overnight. Speech notes where phone used to sit. Trophies on his desk.",
      "Environmental changes reduce bad habits 80% without willpower.",
      "YOUR TURN: Tonight—charge phone outside your bedroom.",
      "#4: Visual Progress",
      "Tom made a paper chain. Every 10-minute practice = one link.",
      "By day 30, it wrapped his room. Physical proof: \"I''m someone who shows up.\"",
      "YOUR TURN: Paper chain, calendar X''s, marble jar—make progress visible."
    ]
  },
  {
    "id": 14,
    "title": "The Comeback",
    "body": [
      "Six months later, same competition. Same venue.",
      "Tom walked on stage, phone forgotten in his pocket.",
      "\"I want to tell you about the day I chose a screen over my dreams, and what happened when I chose my dreams back.\"",
      "Seven minutes of truth. The shame. The hollow hours. The fear. The small daily choices.",
      "Three seconds of silence. Then applause.",
      "Second place. But more importantly—proof he could come back.",
      "Tom today at sixteen: Volunteers as peer mentor. Chain hit 247 links. Placed third at states.",
      "\"My phone''s a tool now, not my personality. I use it. It doesn''t use me.\"",
      "Three months later, fourteen-year-old Layla found him: \"That chain thing—did it work?\"",
      "Tom showed her everything. That night he realized: his recovery gave him new purpose.",
      "The student became the teacher."
    ]
  },
  {
    "id": 15,
    "title": "Your Moment",
    "body": [
      "Tom''s story isn''t about superhuman willpower. It''s about one Tuesday when he decided who he''d been wasn''t who he wanted to become.",
      "Some of you will bookmark this and come back when ready. That''s fine.",
      "But if you''re feeling that pull right now—that voice saying \"maybe I could actually do this\"—don''t ignore it.",
      "Pick ONE thing:",
      "- Write your identity statement in phone notes",
      "- Text one person for weekly check-ins",
      "- Delete one app that takes more than it gives",
      "Not all three. Just one.",
      "The rest of this book will be here.",
      "But if you''re ready now? Move. Don''t let this feeling fade.",
      "In six months, you''ll either wish you''d started today, or you''ll be glad you did.",
      "Your call."
    ]
  }
]'::jsonb WHERE day_number = 1;
