-- SEED DATA FOR E-COMMERCE DATABASE
-- This file contains initial data for all tables

-- Clear existing data (optional - be careful in production)
TRUNCATE users, categories, products, product_images, carts, cart_items, orders, order_items, reviews, carousel_slides RESTART IDENTITY CASCADE;

-- Users
INSERT INTO users (first_name, last_name, email, password, role, phone, address, city, zip_code, is_active, created_at)
VALUES
  ('Admin', 'User', 'admin@example.com', '$2a$10$xVqBM69XEooAj4ZTD8QyIeYD8oYIbHRhG5zAY0.NkUVHOkvd5Xbbu', 'admin', '+212612345678', '123 Admin St', 'Casablanca', '20000', true, NOW()),
  ('John', 'Doe', 'john@example.com', '$2a$10$xVqBM69XEooAj4ZTD8QyIeYD8oYIbHRhG5zAY0.NkUVHOkvd5Xbbu', 'user', '+212612345679', '456 Customer Ave', 'Rabat', '10000', true, NOW()),
  ('Jane', 'Smith', 'jane@example.com', '$2a$10$xVqBM69XEooAj4ZTD8QyIeYD8oYIbHRhG5zAY0.NkUVHOkvd5Xbbu', 'user', '+212612345680', '789 Buyer Blvd', 'Marrakech', '40000', true, NOW()),
  ('Mohamed', 'Alaoui', 'mohamed@example.com', '$2a$10$xVqBM69XEooAj4ZTD8QyIeYD8oYIbHRhG5zAY0.NkUVHOkvd5Xbbu', 'user', '+212612345681', '101 Client St', 'Fes', '30000', true, NOW()),
  ('Fatima', 'Benani', 'fatima@example.com', '$2a$10$xVqBM69XEooAj4ZTD8QyIeYD8oYIbHRhG5zAY0.NkUVHOkvd5Xbbu', 'user', '+212612345682', '202 Shopper Rd', 'Tanger', '90000', true, NOW()),
  ('Ahmed', 'Benjelloun', 'ahmed@example.com', '$2a$10$xVqBM69XEooAj4ZTD8QyIeYD8oYIbHRhG5zAY0.NkUVHOkvd5Xbbu', 'user', '+212612345683', '303 Market St', 'Agadir', '80000', true, NOW());
-- Note: All passwords are 'password123' hashed with bcrypt

-- Categories
INSERT INTO categories (name, slug, description, parent_id, icon, display_order, is_active, created_at)
VALUES
  -- Main categories
  ('Téléphone & Tablette', 'telephone-tablette', 'Smartphones, tablettes et accessoires', NULL, 'FaPhone', 1, true, NOW()),
  ('Informatique', 'informatique', 'Ordinateurs, périphériques et accessoires', NULL, 'FaLaptop', 2, true, NOW()),
  ('TV & High Tech', 'tv-high-tech', 'Téléviseurs, audio et équipements électroniques', NULL, 'FaDesktop', 3, true, NOW()),
  ('Électroménager', 'electromenager', 'Appareils électroménagers pour la maison', NULL, 'FaHome', 4, true, NOW()),
  ('Maison, cuisine & bureau', 'maison-cuisine-bureau', 'Tout pour la maison, la cuisine et le bureau', NULL, 'FaHome', 5, true, NOW()),
  ('Vêtements & Chaussures', 'vetements-chaussures', 'Mode homme, femme et enfant', NULL, 'FaTshirt', 6, true, NOW()),
  ('Beauté & Santé', 'beaute-sante', 'Produits de beauté, soins personnels et bien-être', NULL, 'FaHeartbeat', 7, true, NOW()),
  ('Jeux vidéos & Consoles', 'jeux-videos-consoles', 'Consoles, jeux vidéo et accessoires gaming', NULL, 'FaGamepad', 8, true, NOW()),
  ('Sports & Loisirs', 'sports-loisirs', 'Équipements sportifs et activités de loisirs', NULL, 'FaRunning', 9, true, NOW()),
  
  -- Sub-categories for Téléphone & Tablette
  ('Smartphones', 'smartphones', 'Téléphones mobiles et smartphones', 1, NULL, 1, true, NOW()),
  ('Tablettes', 'tablettes', 'Tablettes tactiles et e-readers', 1, NULL, 2, true, NOW()),
  ('Accessoires téléphone', 'accessoires-telephone', 'Coques, chargeurs et accessoires pour téléphones', 1, NULL, 3, true, NOW()),
  
  -- Sub-categories for Informatique
  ('Ordinateurs portables', 'ordinateurs-portables', 'Laptops et notebooks', 2, NULL, 1, true, NOW()),
  ('Ordinateurs de bureau', 'ordinateurs-bureau', 'PC fixes et tours', 2, NULL, 2, true, NOW()),
  ('Périphériques & Accessoires', 'peripheriques-accessoires', 'Souris, claviers, écrans et autres périphériques', 2, NULL, 3, true, NOW()),
  
  -- Sub-categories for TV & High Tech
  ('Téléviseurs', 'televiseurs', 'TV LED, OLED, 4K et Smart TV', 3, NULL, 1, true, NOW()),
  ('Audio & Son', 'audio-son', 'Enceintes, casques et systèmes audio', 3, NULL, 2, true, NOW()),
  ('Photo & Vidéo', 'photo-video', 'Appareils photo, caméras et accessoires', 3, NULL, 3, true, NOW());

-- Products
INSERT INTO products (name, description, price, discount_price, stock, category, rating, reviews, created_at, updated_at)
VALUES
  -- Smartphones
  ('iPhone 14 Pro', 'Le dernier iPhone avec puce A16 Bionic, écran Super Retina XDR et appareil photo professionnel.', 13999, 12999, 50, 'Smartphones', 4.8, 24, NOW(), NOW()),
  ('Samsung Galaxy S23 Ultra', 'Smartphone haut de gamme avec stylet S Pen intégré, écran Dynamic AMOLED et appareil photo 108MP.', 12999, NULL, 35, 'Smartphones', 4.7, 18, NOW(), NOW()),
  ('Xiaomi Redmi Note 12', 'Smartphone milieu de gamme avec excellent rapport qualité-prix, grand écran AMOLED et batterie 5000mAh.', 2999, 2499, 100, 'Smartphones', 4.5, 32, NOW(), NOW()),
  ('OPPO Reno 8', 'Smartphone fin et léger avec charge rapide 80W, appareil photo 50MP et processeur MediaTek Dimensity.', 4999, 3999, 45, 'Smartphones', 4.3, 15, NOW(), NOW()),
  ('Huawei P50 Pro', 'Smartphone avec système d''appareil photo Leica, écran OLED 120Hz et design premium.', 8999, 7999, 20, 'Smartphones', 4.6, 11, NOW(), NOW()),
  
  -- Tablets
  ('iPad Air 5', 'Tablette avec puce M1, écran Liquid Retina 10.9" et compatibilité Apple Pencil.', 8499, NULL, 30, 'Tablettes', 4.9, 14, NOW(), NOW()),
  ('Samsung Galaxy Tab S8', 'Tablette Android haut de gamme avec écran 11", processeur Snapdragon et S Pen inclus.', 7999, 6999, 25, 'Tablettes', 4.7, 9, NOW(), NOW()),
  ('Lenovo Tab P11 Pro', 'Tablette avec écran OLED 11.5", son JBL et batterie longue durée.', 4999, 4499, 40, 'Tablettes', 4.4, 7, NOW(), NOW()),
  
  -- Phone Accessories
  ('Coque iPhone 14 Pro', 'Coque de protection premium en silicone pour iPhone 14 Pro.', 299, NULL, 200, 'Accessoires téléphone', 4.2, 38, NOW(), NOW()),
  ('Chargeur sans fil Samsung', 'Chargeur à induction rapide 15W compatible avec tous les appareils Qi.', 399, 299, 150, 'Accessoires téléphone', 4.5, 27, NOW(), NOW()),
  ('Écouteurs Bluetooth TWS', 'Écouteurs sans fil avec réduction de bruit et autonomie de 30 heures.', 799, 599, 100, 'Accessoires téléphone', 4.3, 42, NOW(), NOW()),
  
  -- Laptops
  ('MacBook Air M2', 'Ordinateur portable Apple avec puce M2, design fin et léger, écran Retina.', 14999, NULL, 25, 'Ordinateurs portables', 4.9, 16, NOW(), NOW()),
  ('Dell XPS 13', 'Laptop premium avec écran InfinityEdge, processeur Intel Core i7 et châssis en aluminium.', 12999, 11999, 20, 'Ordinateurs portables', 4.8, 13, NOW(), NOW()),
  ('Lenovo ThinkPad X1 Carbon', 'Ordinateur portable professionnel léger, robuste avec sécurité renforcée.', 13499, 11999, 15, 'Ordinateurs portables', 4.7, 8, NOW(), NOW()),
  ('HP Pavilion 15', 'Laptop polyvalent pour travail et divertissement avec écran Full HD et processeur AMD Ryzen.', 7999, 6999, 30, 'Ordinateurs portables', 4.4, 19, NOW(), NOW()),
  ('Acer Nitro 5', 'Ordinateur portable gaming avec carte graphique NVIDIA GeForce RTX, écran 144Hz.', 9999, 8999, 25, 'Ordinateurs portables', 4.6, 22, NOW(), NOW()),
  
  -- Desktop PCs
  ('iMac 24"', 'Ordinateur tout-en-un avec puce M1, écran Retina 4.5K et design ultra-fin.', 17999, NULL, 15, 'Ordinateurs de bureau', 4.8, 7, NOW(), NOW()),
  ('HP Pavilion Desktop', 'PC de bureau compact pour usage quotidien avec processeur Intel et stockage SSD.', 6499, 5999, 20, 'Ordinateurs de bureau', 4.3, 11, NOW(), NOW()),
  
  -- Peripherals
  ('Souris sans fil Logitech MX Master 3', 'Souris ergonomique haute précision avec fonctionnalités avancées.', 999, 899, 50, 'Périphériques & Accessoires', 4.8, 31, NOW(), NOW()),
  ('Clavier mécanique Corsair K70', 'Clavier gaming avec switches Cherry MX et rétroéclairage RGB.', 1299, 1099, 40, 'Périphériques & Accessoires', 4.7, 26, NOW(), NOW()),
  ('Écran Dell 27" 4K', 'Moniteur Ultra HD avec excellente reproduction des couleurs et connectivité complète.', 3999, 3499, 25, 'Périphériques & Accessoires', 4.6, 18, NOW(), NOW()),
  
  -- TVs
  ('Samsung QLED 55" 4K', 'Téléviseur QLED avec résolution 4K, HDR10+ et Smart TV Tizen.', 7999, 6999, 30, 'Téléviseurs', 4.7, 22, NOW(), NOW()),
  ('LG OLED 65" 4K', 'TV OLED avec Dolby Vision, Dolby Atmos et système webOS.', 12999, 11499, 20, 'Téléviseurs', 4.9, 15, NOW(), NOW()),
  ('TCL LED 50" 4K', 'Téléviseur abordable avec Android TV, Google Assistant et design sans bordure.', 4999, 4499, 40, 'Téléviseurs', 4.4, 28, NOW(), NOW()),
  
  -- Audio
  ('Bose QuietComfort 45', 'Casque sans fil avec réduction de bruit de premier ordre et confort supérieur.', 2799, 2499, 35, 'Audio & Son', 4.8, 29, NOW(), NOW()),
  ('JBL Charge 5', 'Enceinte Bluetooth portable, étanche, avec autonomie de 20 heures.', 1499, 1299, 50, 'Audio & Son', 4.7, 37, NOW(), NOW()),
  ('Sonos Beam Gen 2', 'Barre de son compacte avec Dolby Atmos et contrôle vocal.', 3999, 3599, 25, 'Audio & Son', 4.6, 14, NOW(), NOW()),
  
  -- Home Appliances
  ('Réfrigérateur Samsung Twin Cooling', 'Réfrigérateur double porte avec système de refroidissement indépendant.', 8999, 7999, 15, 'Électroménager', 4.5, 8, NOW(), NOW()),
  ('Machine à laver LG 9kg', 'Lave-linge avec technologie AI Direct Drive et vapeur anti-allergènes.', 6499, 5799, 20, 'Électroménager', 4.6, 13, NOW(), NOW()),
  ('Aspirateur robot Roborock S7', 'Robot aspirateur et laveur avec navigation laser et contrôle via application.', 3999, 3499, 30, 'Électroménager', 4.7, 19, NOW(), NOW()),
  
  -- Home & Kitchen
  ('Ensemble de casseroles Tefal', 'Set de 5 casseroles en inox avec poignées amovibles.', 1599, 1299, 25, 'Maison, cuisine & bureau', 4.4, 23, NOW(), NOW()),
  ('Machine à café Nespresso', 'Machine à capsules compacte avec réservoir d''eau 0.7L.', 999, 799, 40, 'Maison, cuisine & bureau', 4.6, 41, NOW(), NOW()),
  ('Bureau réglable en hauteur', 'Bureau assis-debout électrique avec plateau en bois.', 2499, 1999, 20, 'Maison, cuisine & bureau', 4.5, 17, NOW(), NOW()),
  
  -- Clothing
  ('Veste en cuir homme', 'Veste en cuir véritable avec doublure, style classique.', 1999, 1799, 30, 'Vêtements & Chaussures', 4.3, 12, NOW(), NOW()),
  ('Robe d''été femme', 'Robe légère à fleurs, idéale pour la saison estivale.', 699, 499, 50, 'Vêtements & Chaussures', 4.2, 19, NOW(), NOW()),
  ('Baskets Adidas Originals', 'Sneakers confortables et stylées pour un usage quotidien.', 899, 799, 45, 'Vêtements & Chaussures', 4.5, 27, NOW(), NOW()),
  
  -- Gaming
  ('PlayStation 5', 'Console de jeu dernière génération avec manette DualSense.', 6499, NULL, 15, 'Jeux vidéos & Consoles', 4.9, 36, NOW(), NOW()),
  ('Nintendo Switch OLED', 'Console hybride avec écran OLED 7" et station d''accueil améliorée.', 3999, 3799, 25, 'Jeux vidéos & Consoles', 4.7, 29, NOW(), NOW()),
  ('FIFA 23', 'Jeu de football avec modes Carrière, Ultimate Team et Volta améliorés.', 599, 499, 100, 'Jeux vidéos & Consoles', 4.4, 47, NOW(), NOW());

-- Product Images
INSERT INTO product_images (product_id, image_url)
VALUES
  -- iPhone 14 Pro images
  (1, 'https://images.pexels.com/photos/5750001/pexels-photo-5750001.jpeg'),
  (1, 'https://images.pexels.com/photos/5750025/pexels-photo-5750025.jpeg'),
  (1, 'https://images.pexels.com/photos/5749989/pexels-photo-5749989.jpeg'),
  
  -- Samsung Galaxy S23 Ultra images
  (2, 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg'),
  (2, 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg'),
  
  -- Xiaomi Redmi Note 12 images
  (3, 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'),
  (3, 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'),
  
  -- OPPO Reno 8 images
  (4, 'https://images.pexels.com/photos/2643698/pexels-photo-2643698.jpeg'),
  (4, 'https://images.pexels.com/photos/193004/pexels-photo-193004.jpeg'),
  
  -- Huawei P50 Pro images
  (5, 'https://images.pexels.com/photos/1042143/pexels-photo-1042143.jpeg'),
  
  -- iPad Air 5 images
  (6, 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg'),
  (6, 'https://images.pexels.com/photos/38568/apple-imac-ipad-workplace-38568.jpeg'),
  
  -- Samsung Galaxy Tab S8 images
  (7, 'https://images.pexels.com/photos/1440504/pexels-photo-1440504.jpeg'),
  
  -- Lenovo Tab P11 Pro images
  (8, 'https://images.pexels.com/photos/1742370/pexels-photo-1742370.jpeg'),
  
  -- Accessoires téléphone
  (9, 'https://images.pexels.com/photos/4068375/pexels-photo-4068375.jpeg'),
  (10, 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg'),
  (11, 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg'),
  
  -- MacBook Air M2 images
  (12, 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg'),
  (12, 'https://images.pexels.com/photos/4260477/pexels-photo-4260477.jpeg'),
  (12, 'https://images.pexels.com/photos/459653/pexels-photo-459653.jpeg'),
  
  -- Dell XPS 13 images
  (13, 'https://images.pexels.com/photos/705675/pexels-photo-705675.jpeg'),
  (13, 'https://images.pexels.com/photos/3970330/pexels-photo-3970330.jpeg'),
  
  -- Autres ordinateurs portables
  (14, 'https://images.pexels.com/photos/2528118/pexels-photo-2528118.jpeg'),
  (15, 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg'),
  (16, 'https://images.pexels.com/photos/7974/pexels-photo.jpg'),
  
  -- Ordinateurs de bureau
  (17, 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg'),
  (18, 'https://images.pexels.com/photos/326478/pexels-photo-326478.jpeg'),
  
  -- Périphériques
  (19, 'https://images.pexels.com/photos/3937174/pexels-photo-3937174.jpeg'),
  (20, 'https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg'),
  
  -- TV Samsung images
  (21, 'https://images.pexels.com/photos/6976103/pexels-photo-6976103.jpeg'),
  (21, 'https://images.pexels.com/photos/775907/pexels-photo-775907.jpeg'),
  
  -- LG OLED TV images
  (22, 'https://images.pexels.com/photos/5490349/pexels-photo-5490349.jpeg'),
  
  -- TCL TV
  (23, 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg'),
  
  -- Bose QuietComfort 45 images
  (24, 'https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg'),
  (24, 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg'),
  
  -- JBL Charge 5 images
  (25, 'https://images.pexels.com/photos/1591324/pexels-photo-1591324.jpeg'),
  
  -- Sonos Beam
  (26, 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg'),
  
  -- Électroménager
  (27, 'https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg'),
  (28, 'https://images.pexels.com/photos/5824513/pexels-photo-5824513.jpeg'),
  
  -- Aspirateur robot
  (29, 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg'),
  
  -- Maison & Cuisine
  (30, 'https://images.pexels.com/photos/4551309/pexels-photo-4551309.jpeg'),
  (31, 'https://images.pexels.com/photos/2638019/pexels-photo-2638019.jpeg'),
  (32, 'https://images.pexels.com/photos/3771691/pexels-photo-3771691.jpeg'),
  
  -- Vêtements
  (33, 'https://images.pexels.com/photos/4560182/pexels-photo-4560182.jpeg'),
  (34, 'https://images.pexels.com/photos/15422152/pexels-photo-15422152.jpeg'),
  (35, 'https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg'),
  
  -- PlayStation 5 images
  (36, 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg'),
  (36, 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg'),
  
  -- Nintendo Switch images
  (37, 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg'),
  
  -- FIFA 23
  (38, 'https://images.pexels.com/photos/3131971/pexels-photo-3131971.jpeg');

-- Create sample reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified, is_approved, created_at)
VALUES 
  -- iPhone 14 Pro reviews
  (1, 2, 5, 'Excellent smartphone', 'La qualité de l''appareil photo est incroyable. La batterie dure toute la journée.', true, true, NOW() - INTERVAL '10 days'),
  (1, 3, 4, 'Très bon mais cher', 'Produit de très haute qualité mais le prix reste élevé pour ce que c''est.', true, true, NOW() - INTERVAL '8 days'),
  (1, 4, 5, 'Le meilleur iPhone', 'Après avoir utilisé Android pendant des années, je suis impressionné par les performances.', false, true, NOW() - INTERVAL '5 days'),
  
  -- Samsung Galaxy S23 Ultra reviews
  (2, 3, 5, 'Parfait pour la photo', 'Les capacités photo de ce téléphone sont exceptionnelles, surtout en faible luminosité.', true, true, NOW() - INTERVAL '15 days'),
  (2, 5, 4, 'Presque parfait', 'Excellent appareil mais l''autonomie pourrait être meilleure.', true, true, NOW() - INTERVAL '12 days'),
  
  -- MacBook Air M2 reviews
  (12, 2, 5, 'Ultra rapide', 'La puce M2 est incroyablement rapide même pour des tâches lourdes comme l''édition vidéo.', true, true, NOW() - INTERVAL '20 days'),
  (12, 4, 5, 'Silencieux et efficace', 'Aucun bruit de ventilateur et la batterie dure toute la journée. Impressionnant!', true, true, NOW() - INTERVAL '18 days'),
  
  -- PlayStation 5 reviews
  (36, 3, 5, 'Une révolution', 'Les temps de chargement sont quasi inexistants. La manette DualSense apporte une immersion incroyable.', true, true, NOW() - INTERVAL '30 days'),
  (36, 5, 4, 'Excellente console', 'Graphismes impressionnants mais peu de jeux exclusifs pour le moment.', true, true, NOW() - INTERVAL '25 days');

-- Create sample orders
INSERT INTO orders (user_id, reference, status, shipping_address, shipping_city, shipping_zip_code, phone_number, total_price, created_at, updated_at)
VALUES
  (2, 'ORD-ABC12345', 'delivered', '456 Customer Ave', 'Rabat', '10000', '+212612345679', 15498, NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days'),
  (3, 'ORD-DEF67890', 'shipped', '789 Buyer Blvd', 'Marrakech', '40000', '+212612345680', 8499, NOW() - INTERVAL '15 days', NOW() - INTERVAL '13 days'),
  (4, 'ORD-GHI24680', 'processing', '101 Client St', 'Fes', '30000', '+212612345681', 12999, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
  (5, 'ORD-JKL13579', 'pending', '202 Shopper Rd', 'Tanger', '90000', '+212612345682', 4999, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (2, 'ORD-MNO97531', 'cancelled', '456 Customer Ave', 'Rabat', '10000', '+212612345679', 999, NOW() - INTERVAL '45 days', NOW() - INTERVAL '44 days');

-- Create sample order items
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES 
  -- Order 1 (John Doe)
  (1, 1, 1, 12999),  -- iPhone 14 Pro with discount
  (1, 9, 1, 299),    -- iPhone case
  (1, 10, 1, 299),   -- Wireless charger with discount
  (1, 11, 1, 599),   -- TWS earbuds with discount
  (1, 24, 1, 2499),  -- Bose QuietComfort with discount
  
  -- Order 2 (Jane Smith)
  (2, 6, 1, 8499),   -- iPad Air 5
  
  -- Order 3 (Mohamed Alaoui)
  (3, 2, 1, 12999),  -- Samsung Galaxy S23 Ultra
  
  -- Order 4 (Fatima Benani)
  (4, 3, 2, 2499),   -- Xiaomi Redmi Note 12 with discount
  
  -- Order 5 (John Doe - cancelled)
  (5, 11, 1, 599),   -- TWS earbuds with discount
  (5, 10, 1, 299);   -- Wireless charger with discount

-- Create carts for users
INSERT INTO carts (user_id, created_at)
VALUES
  (2, NOW()),
  (3, NOW()),
  (4, NOW()),
  (5, NOW());

-- Add items to carts
INSERT INTO cart_items (cart_id, product_id, quantity, created_at)
VALUES
  (1, 13, 1, NOW()),  -- Dell XPS 13 in John's cart
  (1, 19, 1, NOW()),  -- Dell Monitor in John's cart
  (2, 25, 1, NOW()),  -- JBL Speaker in Jane's cart
  (2, 11, 1, NOW()),  -- TWS earbuds in Jane's cart
  (3, 36, 1, NOW()),  -- PS5 in Mohamed's cart
  (4, 32, 2, NOW());  -- Dress in Fatima's cart

-- Create carousel slides
INSERT INTO carousel_slides (title, subtitle, button_text, button_link, image, active, "order", created_at, updated_at)
VALUES
  ('Nouveaux smartphones', 'Découvrez notre gamme de smartphones dernière génération', 'Voir les offres', '/products?category=smartphones', 'https://images.pexels.com/photos/1447254/pexels-photo-1447254.jpeg', true, 1, NOW(), NOW()),
  ('Soldes d''été', 'Jusqu''à 50% de réduction sur une sélection d''articles', 'Profiter maintenant', '/products?sale=true', 'https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg', true, 2, NOW(), NOW()),
  ('Équipement gaming', 'Élevez votre expérience de jeu avec notre sélection', 'Découvrir', '/products?category=jeux-videos-consoles', 'https://images.pexels.com/photos/3945659/pexels-photo-3945659.jpeg', true, 3, NOW(), NOW()),
  ('Audio premium', 'Une qualité sonore exceptionnelle pour les audiophiles', 'Explorer', '/products?category=audio-son', 'https://images.pexels.com/photos/1591470/pexels-photo-1591470.jpeg', true, 4, NOW(), NOW()); 