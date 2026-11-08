# Product Requirements Document — Shared Couple Gallery

## Overview
A private photo gallery for exactly two linked users, focused on preserving shared memories rather than social networking.

## Requirements
- Only authenticated and authorized members of a couple can access its memories.
- Users can register, sign in, and sign out.
- Photos and related metadata must be private.
- Authorization must be enforced by Supabase RLS and Storage policies, not frontend routing alone.

## Core Features
1. Authentication
2. Photo upload and private gallery
3. Captions, dates, reactions, and comments
4. Anniversary and special dates
5. Memory map
6. Voice notes up to 30 seconds
7. Time capsule

## User Flow
Register/sign in → join or create a couple space → view shared gallery → upload and interact with memories.

## Architecture
React SPA → Supabase Auth → PostgreSQL (RLS) + private Supabase Storage.

## Database Schema
To be defined in the database phase after deciding the couple invitation/linking model.

## Design & Technical Constraints
- React + Vite, JavaScript
- Tailwind CSS
- Supabase Auth, Database, Storage
- React Router, Lucide React, date-fns, Leaflet / React-Leaflet
- Mobile-first, private by default