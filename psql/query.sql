SELECT pets.id, MAX(pets.owner_id) AS owner_id_max, MAX(pets.owner_id) AS owner_id_min
FROM
	people
	JOIN pets AS p2 ON people.id = pets.owner_id
	LEFT JOIN pets AS p ON pets.id = pets.id,
	pets,
	(
		SELECT people.name
		FROM
			people
	) AS xyz
WHERE people.id = pets.owner_id
GROUP BY pets.id
ORDER BY pets.id
LIMIT 5
OFFSET 5

