BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS `history` (
	`id`	INTEGER,
	`timestamp`	NUMERIC,
	`ClassNumber`	INTEGER,
	`SeatsTaken`	INTEGER,
	`SeatsOpen`	INTEGER,
	`ClassCapacity`	INTEGER,
	`WaitListTotal`	INTEGER,
	`WaitListCapacity`	INTEGER,
	PRIMARY KEY(`id`)
);
CREATE TABLE IF NOT EXISTS `fields` (
	`field`	TEXT,
	`desc`	TEXT,
	PRIMARY KEY(`field`)
);
CREATE TABLE IF NOT EXISTS `classes` (
	`ClassNumber`	INTEGER,
	`title`	TEXT,
	`AddConsent`	TEXT,
	`Campus`	TEXT,
	`Career`	TEXT,
	`Description`	TEXT,
	`Dates`	TEXT,
	`EnrollmentRequirements`	TEXT,
	`Grading`	TEXT,
	`Instructors`	TEXT,
	`Location`	TEXT,
	`Meets`	TEXT,
	`Room`	TEXT,
	`Session`	TEXT,
	`Status`	TEXT,
	`Topic`	TEXT,
	`Units`	TEXT,
	`Notes`	TEXT,
	`ClassAttributes`	TEXT,
	`InstructionMode`	TEXT,
	`DropConsent`	TEXT,
	PRIMARY KEY(`ClassNumber`)
);
CREATE INDEX IF NOT EXISTS `idx_histoClassNum` ON `history` (
	`ClassNumber`	ASC
);
CREATE VIEW `total-current` AS select history.classnumber,title,meets,SeatsTaken,(SeatsOpen-waitlisttotal) from history,classes
where history.classnumber = classes.classnumber
group by history.classnumber;
CREATE VIEW perso_fall2017 AS select classes.classnumber,title,status,SeatsTaken,(SeatsOpen-waitlisttotal) from classes,history 
where history.classnumber = classes.classnumber
and history.classnumber in (
  select classes.classnumber from classes 
  where title like 'ITEC 423%' or title like 'ITEC 464%'
  union SELECT DISTINCT * FROM (VALUES(2768),(2796),(6571),(6572),(6764),(7142)) 
)
group by classes.classnumber
order by title asc;
CREATE VIEW ITEC_fall2017 AS select history.classnumber,title,enrollmentrequirements,meets,InstructionMode,Status,SeatsTaken,(SeatsOpen-waitlisttotal) from history,classes
where history.classnumber = classes.classnumber
and title like 'ITEC%'
group by classes.classnumber;
COMMIT;
