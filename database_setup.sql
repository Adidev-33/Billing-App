CREATE DATABASE IF NOT EXISTS interior_design_db;

-- Switch to the new database
USE interior_design_db;

-- Create the 'items' table
CREATE TABLE IF NOT EXISTS items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT
);

-- Create the 'materials' table
CREATE TABLE IF NOT EXISTS materials (
  material_id INT AUTO_INCREMENT PRIMARY KEY,
  material_name VARCHAR(255) NOT NULL UNIQUE
);

-- Create the 'rates' table
CREATE TABLE IF NOT EXISTS rates (
  rate_id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  material_id INT NOT NULL,
  uom VARCHAR(10) NOT NULL,
  rate_per_sqcm DECIMAL(10, 2) NOT NULL,
  UNIQUE KEY unique_rate (item_id, material_id, uom),
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE CASCADE
);

-- Create the 'invoices' table
CREATE TABLE IF NOT EXISTS invoices (
  invoice_id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number INT NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  invoice_title VARCHAR(255),
  grand_total DECIMAL(10, 2) NOT NULL,
  invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'invoice_items' table
CREATE TABLE IF NOT EXISTS invoice_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  slno INT NOT NULL,
  item_description TEXT,
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  uom VARCHAR(10),
  quantity INT,
  unit_price DECIMAL(10, 2),
  amount DECIMAL(10, 2),
  tax_percentage DECIMAL(5, 2),
  total_amount DECIMAL(10, 2),
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);
