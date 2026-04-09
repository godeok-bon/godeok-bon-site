insert into public.notices (id, title, content, category, pinned, views, created_at, updated_at)
values
  (
    51,
    'ㅎㅇ',
    '<p>ㅎㅇ</p>',
    '센터소식',
    true,
    9,
    '2026-03-31T16:01:08.340Z',
    '2026-03-31T16:01:08.340Z'
  ),
  (
    49,
    'ㅎㅇ',
    '<p>ㅎㅇ</p>',
    '공지사항',
    false,
    2,
    '2026-03-31T16:00:56.484Z',
    '2026-03-31T16:00:56.484Z'
  ),
  (
    48,
    '사회성 그룹 프로그램 신규 모집',
    '<p>또래 상호작용과 협동 활동을 중심으로 하는 사회성 그룹 참여 아동을 모집합니다.</p><p>연령과 현재 상호작용 수준을 고려해 소규모로 구성되며, 상담 후 적합 여부를 안내드립니다.</p><p>그룹 시작 전에는 보호자 상담이 함께 진행됩니다.</p>',
    '센터소식',
    false,
    138,
    '2026-03-26T10:30:00.000Z',
    '2026-03-26T10:30:00.000Z'
  ),
  (
    47,
    '토요일 운영 시간 안내',
    '<p>토요일 운영 시간은 오전 10시부터 오후 6시까지입니다.</p><p>주말 상담 및 치료 일정은 예약 순으로 배정되므로 미리 문의해 주시면 더 원활하게 안내드릴 수 있습니다.</p>',
    '홍보',
    false,
    104,
    '2026-03-21T11:00:00.000Z',
    '2026-03-21T11:00:00.000Z'
  ),
  (
    46,
    '평가 후 치료 연계 절차 안내',
    '<p>초기 상담과 관찰 후에는 아이의 정서, 언어, 인지, 사회성 영역을 함께 고려해 필요한 치료 방향을 제안드립니다.</p><p>놀이치료, 언어치료, 인지치료, 사회성 그룹은 상담 결과에 따라 연계될 수 있습니다.</p>',
    '홍보',
    false,
    75,
    '2026-03-14T14:00:00.000Z',
    '2026-03-14T14:00:00.000Z'
  )
on conflict (id) do update
set
  title = excluded.title,
  content = excluded.content,
  category = excluded.category,
  pinned = excluded.pinned,
  views = excluded.views,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.home_feeds (id, title, content, category, tags, image_url, created_at, updated_at)
values
  (
    1,
    '아이 불안 줄이는 "놀잇감의 마법" 학부모 워크숍',
    E'아이들의 건강한 성장을 위한 단단한 뿌리, 고덕 본 아동발달센터입니다.\n안녕하세요. 고덕 본 아동발달센터입니다. 저희 센터는 분야별 베테랑 치료진이 모여, 아이들이 세상에 단단히 뿌리 내릴 수 있도록 돕는 전문 기관입니다.\n\n왜 고덕 본(本)인가요?\n\n본(本)은 뿌리이자 근본을 의미합니다. 잎과 꽃이 화려한 것도 중요하지만, 보이지 않는 곳에서 아이의 마음이 얼마나 단단하게 뿌리 내리고 있는지가 평생의 삶을 결정합니다. 우리는 아이의 근본적인 자아존중감과 마음의 힘을 키우는 데 집중합니다.',
    'Program',
    array['감각통합', '소그룹수업', '아동발달'],
    '/uploads/home-feed/25b12cbe-6f6e-43ff-83ec-30895d112f7b.png',
    '2026-03-31T17:52:25.508Z',
    '2026-03-31T17:52:25.508Z'
  )
on conflict (id) do update
set
  title = excluded.title,
  content = excluded.content,
  category = excluded.category,
  tags = excluded.tags,
  image_url = excluded.image_url,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.site_media (key, image_url, updated_at)
values
  ('mainSlide1', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('mainSlide2', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('mainSlide3', 'https://images.unsplash.com/photo-1536640712-4d4c36ef0e52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('aboutHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('columnHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('programHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('contactHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('noticeHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('noticeDetailHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('noticeWriteHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('noticeEditHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('feedWriteHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now())),
  ('feedEditHero', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', timezone('utc'::text, now()))
on conflict (key) do update
set image_url = excluded.image_url,
    updated_at = excluded.updated_at;

select setval(pg_get_serial_sequence('public.notices', 'id'), coalesce((select max(id) from public.notices), 1), true);
select setval(pg_get_serial_sequence('public.home_feeds', 'id'), coalesce((select max(id) from public.home_feeds), 1), true);
