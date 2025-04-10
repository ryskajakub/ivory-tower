with 
my_q as (
  with recursive boss_sub(boss, id, depth) as (
    select null::int, null::int, -1, '{}'::jsonb as data
    union all
    select person.boss, person.id, depth + 1, jsonb_build_object('name', name, 'id', person.id) from person 
    join boss_sub on boss_sub.id is not distinct from person.boss
  )
  select * from boss_sub where id is not null
)
,
-- max_depth as ( select max(depth) from my_q )
-- ,
-- depth_data as ( select depth, boss, jsonb_agg(data) as data from my_q group by depth, boss order by depth )
-- ,
my_2q as (
  with recursive rec1 (dpth, d) as (
    -- select max, (select jsonb_object_agg(depth_data.boss, depth_data.data) from depth_data where depth_data.depth = max_depth.max) as record from max_depth
    select max(depth) + 1, '{}'::jsonb from my_q
    -- select max_depth, (select jsonb_agg() from )
    union all
    select dpth - 1, (
      select jsonb_object_agg(coalesce(t.key, '0'), t.value) as x from (
        select boss as key, jsonb_agg(data || jsonb_build_object('sub', coalesce(value, '[]'::jsonb))) as value
        from my_q
        left join jsonb_each(rec1.d) as each on each.key = my_q.id::text
        where depth = (rec1.dpth - 1)
        group by boss
      ) as t 
      -- select '{}'::jsonb
      -- select jsonb_build_object('dethp2', dpth)
        -- select data || jsonb_build_object('sub', value) from my_q 
        -- left join jsonb_each(rec1.d) as each on each.key = my_q.id::text
        -- where depth = dpth - 1
      -- select jsonb_object_agg(depth_data.boss, depth_data.data) from jsonb_each(d) as each
      -- join person on person.id::text = each.key
      -- join depth_data on depth_data.boss = 
      -- join depth_data on each.key = depth_data.boss::text
      -- where depth_data.depth = depth - 1
    ) as xxx from rec1 where dpth > 0
  )
  select * from rec1
)

select d->'0'->0 as result from my_2q where dpth = 0

-- select * from my_2q

-- select jsonb_object_agg(depth_data.boss, depth_data.data) from depth_data where depth_data.depth = 2

-- select * from depth_data

-- select * from my_2q
-- select * from my_2q

-- select * from jsonb_each('{"8": [{"name": "mateusz"}]}') as each
-- join person on person.id::text = each.key

-- select data || jsonb_build_object('sub', value), * from my_q 
-- select  from my_q 
-- select jsonb_build_object(boss, jsonb_agg(data || jsonb_build_object('sub', coalesce(value, '[]'::jsonb)))) from my_q 
-- select jsonb_object_agg(t.key, t.value) from (
--   select boss as key, jsonb_agg(data || jsonb_build_object('sub', coalesce(value, '[]'::jsonb))) as value
--   from my_q
--   left join jsonb_each('{"8": [{"name": "mateusz"}]}') as each on each.key = my_q.id::text
--   where depth = 2
--   group by boss
-- ) as t 
