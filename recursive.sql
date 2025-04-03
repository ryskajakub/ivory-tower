with 

my_q as (
with recursive boss_sub(boss, id, depth) as (
select null::int, id, 0, jsonb_build_object('name', name) as data from person where person.boss is null
union all
select person.boss, person.id, depth + 1, jsonb_build_object('name', name) from person 
join boss_sub on boss_sub.id = person.boss
)
select * from boss_sub
),
max_depth as ( select max(depth) from my_q )
,depth_data as ( select depth, boss, jsonb_agg(data) as data from my_q where boss is not null group by depth, boss )
,my_2q as (
  with recursive rec1 (depth) as (
    select max+1 from max_depth
    union all
    select depth-1 from rec1 where depth > 0
  ) 
  select * from rec1
)

select * from depth_data
;
