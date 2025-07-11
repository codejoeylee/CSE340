-- SQL statements for Assignment 2

-- Task 1.1: Insert new account for Tony Stark
INSERT INTO account (first_name, last_name, email, password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Task 1.2: Update Tony Stark's account_type to 'Admin'
UPDATE account
SET account_type = 'Admin'
WHERE email = 'tony@starkent.com';

-- Task 1.3: Delete Tony Stark's account
DELETE FROM account
WHERE email = 'tony@starkent.com';

-- Task 1.4: Update description of GM Hummer from 'small interiors' to 'a huge interior'
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE make = 'GM' AND model = 'Hummer';

-- Task 1.5: Select make, model, and classification_name for 'Sport' category using INNER JOIN
SELECT
    i.make,
    i.model,
    c.classification_name
FROM
    inventory AS i
INNER JOIN
    classification AS c ON i.classification_id = c.classification_id
WHERE
    c.classification_name = 'Sport';

-- Task 1.6: Update all image and thumbnail paths to include '/vehicles'
UPDATE inventory
SET
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');