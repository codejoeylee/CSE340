-- Drop tables if they already exist
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;

-- Optional: Drop type if it exists
DROP TYPE IF EXISTS account_type_enum;

-- Create a custom ENUM type for account_type
CREATE TYPE account_type_enum AS ENUM ('Client', 'Admin', 'Employee');

-- Create the account table
CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    account_type account_type_enum DEFAULT 'Client',
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- Create the classification table
CREATE TABLE classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(50) NOT NULL
);

-- Create the inventory table
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    make VARCHAR(50), -- Defined as 'make'
    model VARCHAR(50), -- Defined as 'model'
    inv_description TEXT,
    inv_image VARCHAR(255),
    inv_thumbnail VARCHAR(255),
    classification_id INT REFERENCES classification(classification_id)
);

-- Insert sample classifications
INSERT INTO classification (classification_name) VALUES
('Sport'),
('SUV'),
('Truck'),
('Electric');

-- Insert sample inventory
INSERT INTO inventory (make, model, inv_description, inv_image, inv_thumbnail, classification_id) VALUES
('GM', 'Hummer', 'This vehicle has small interiors and massive build', '/images/hummer.jpg', '/images/hummer-thumb.jpg', 2),
('Ford', 'Mustang', 'Sporty and stylish', '/images/mustang.jpg', '/images/mustang-thumb.jpg', 1),
('Tesla', 'Model X', 'Electric SUV with futuristic features', '/images/modelx.jpg', '/images/modelx-thumb.jpg', 4),
('Chevrolet', 'Camaro', 'Muscle car with sporty design', '/images/camaro.jpg', '/images/camaro-thumb.jpg', 1);


-- 4️. Update description of GM Hummer from 'small interiors' to 'a huge interior'
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE make = 'GM' AND model = 'Hummer'; -- CORRECTED: Used 'make' and 'model'

-- 6️. Update image paths to include '/vehicles'
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');