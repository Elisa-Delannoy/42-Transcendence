#!/bin/bash

DB_PATH="back/DB/database.db"

echo "Seeding tournament table..."

sqlite3 $DB_PATH <<EOF
DELETE FROM tournament;

INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (1,11,7,2,13,10,16,8,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (3,5,9,1,4,10,13,15,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (2,1,4,8,11,7,5,6,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (5,9,16,14,15,12,7,8,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (10,6,8,13,2,7,14,11,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (4,12,6,1,11,15,8,13,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (16,13,6,3,7,2,5,4,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (12,16,11,3,10,6,1,14,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (8,15,6,1,9,12,16,11,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (14,3,4,15,1,11,12,6,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (8,1,5,15,13,12,16,14,1);
INSERT INTO tournament (winner_id, second_place_id, third_place_id, fourth_place_id,
                        fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id, onchain)
VALUES (2,4,14,11,7,9,6,1,1);


EOF

echo "✅ Done! Tournament table seeded."
