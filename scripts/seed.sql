-- Seed test data for development

-- Create test users
INSERT INTO users (id, name, email, password, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'สมชายเจ้าของร้าน', 'owner@example.com', '$2a$10$fake_hash_owner', 'OWNER'),
  ('550e8400-e29b-41d4-a716-446655440002', 'กัญญาลูกค้า', 'customer@example.com', '$2a$10$fake_hash_customer', 'CUSTOMER'),
  ('550e8400-e29b-41d4-a716-446655440003', 'พัฒนเจ้าของร้าน 2', 'owner2@example.com', '$2a$10$fake_hash_owner2', 'OWNER')
ON CONFLICT DO NOTHING;

-- Create test stores
INSERT INTO stores (id, owner_id, name, description, phone, address) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'ร้านตัดผม "สมชายบาร์เบอร์"', 'ร้านตัดผมสุดเป็นมิตรและสะอาด', '0812345678', '123 ถ.สุขุมวิท กรุงเทพฯ'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'ร้านสปา "สมจิตต์สปา"', 'ร้านสปาพรีเมี่ยมในกรุงเทพ', '0823456789', '456 ถ.เพชรบุรี กรุงเทพฯ'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'ศูนย์ความงาม "พัฒนา บิวตี้"', 'ศูนย์บริการความงามครบวงจร', '0834567890', '789 ถ.สีลม กรุงเทพฯ')
ON CONFLICT DO NOTHING;

-- Create test services
INSERT INTO services (id, store_id, name, duration_minutes) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'ตัดผมผู้ชาย', 30),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'ตัดผม + เล้นดำเนิน', 45),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'นวดเต็มตัว 1 ชั่วโมง', 60),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 'ทำเล้นผม', 45)
ON CONFLICT DO NOTHING;

-- Create test time slots
INSERT INTO time_slots (id, store_id, date, start_time, end_time, capacity, booked_count) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '09:00', '10:00', 3, 0),
  ('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '10:00', '11:00', 3, 1),
  ('850e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '14:00', '15:00', 2, 0),
  ('850e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', CURRENT_DATE + INTERVAL '2 days', '10:00', '12:00', 2, 0)
ON CONFLICT DO NOTHING;

-- Create test booking
INSERT INTO bookings (id, customer_id, store_id, service_id, slot_id, status) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'PENDING')
ON CONFLICT DO NOTHING;
