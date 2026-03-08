-- Multi-Store Queue Booking System - Database Schema
-- Run this script to create all tables

-- Enums
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'OWNER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id"         SERIAL PRIMARY KEY,
  "name"       VARCHAR(255) NOT NULL,
  "email"      VARCHAR(255) NOT NULL UNIQUE,
  "password"   VARCHAR(255) NOT NULL,
  "role"       "Role" NOT NULL DEFAULT 'CUSTOMER',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stores table
CREATE TABLE IF NOT EXISTS "stores" (
  "id"          SERIAL PRIMARY KEY,
  "name"        VARCHAR(255) NOT NULL,
  "description" TEXT,
  "owner_id"    INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS "services" (
  "id"               SERIAL PRIMARY KEY,
  "store_id"         INTEGER NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "name"             VARCHAR(255) NOT NULL,
  "duration_minutes" INTEGER NOT NULL DEFAULT 30,
  "price"            NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Time slots table
CREATE TABLE IF NOT EXISTS "time_slots" (
  "id"           SERIAL PRIMARY KEY,
  "store_id"     INTEGER NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "slot_time"    TIMESTAMPTZ NOT NULL,
  "is_available" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS "bookings" (
  "id"         SERIAL PRIMARY KEY,
  "store_id"   INTEGER NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "user_id"    INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "service_id" INTEGER NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
  "slot_id"    INTEGER NOT NULL REFERENCES "time_slots"("id") ON DELETE CASCADE,
  "status"     "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_stores_owner_id"    ON "stores"("owner_id");
CREATE INDEX IF NOT EXISTS "idx_services_store_id"  ON "services"("store_id");
CREATE INDEX IF NOT EXISTS "idx_time_slots_store_id" ON "time_slots"("store_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_user_id"   ON "bookings"("user_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_store_id"  ON "bookings"("store_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_slot_id"   ON "bookings"("slot_id");
