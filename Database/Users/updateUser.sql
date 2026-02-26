UPDATE users
SET username = $1,
    email = $2,
    password = $3
WHERE id = $4;