Votely - A secure real-time polling application with bot protection and duplicate prevention mechanisms.


Votely is a real-time poll creation and voting platform built using Next.js and Supabase. It allows users to create polls, vote securely, and view live results instantly.

The application is designed with a strong focus on fairness, vote integrity, and real-time performance.

Live Demo
votely-one.vercel.app

Overview

Votely provides a simple yet secure polling system where users can:

Create custom polls with multiple options

Share a unique poll link

Vote securely

View live results without refreshing

Prevent duplicate or spam voting

The system combines frontend validation, backend verification, and database-level constraints to ensure fairness.

Key Features

Dynamic poll creation

Real-time result updates

One vote per user enforcement

Browser-based unique voter tracking

IP-based duplicate prevention

Cloudflare Turnstile CAPTCHA integration

Percentage-based result bars

Total vote counter

Copyable poll link

Fully deployed production application

Technology Stack
Frontend

Next.js (App Router)

React

Tailwind CSS

Backend

Next.js API Routes

Supabase (PostgreSQL)

Security and Fairness

Cloudflare Turnstile CAPTCHA

Browser-based voter identification

IP tracking

Database-level unique constraints

Deployment

Vercel

System Workflow
Poll Creation

User enters a question and multiple options

Poll data is stored in Supabase

A unique poll ID is generated

A shareable link is created

Voting Process

When a user visits a poll:

A unique voter_id is generated and stored in localStorage

Poll details are fetched from Supabase

User selects an option

CAPTCHA token is generated

Vote is submitted to a secure API route

The server then:

Verifies CAPTCHA

Captures IP address

Validates duplicate voting

Inserts vote into the database

Real-Time Updates

Supabase Realtime listens for new vote insertions

All connected clients receive updates instantly

Result bars update automatically without refreshing

Fairness and Anti-Spam Mechanisms

Vote integrity is the most critical part of a polling system. Votely uses multiple independent protection layers.

1. CAPTCHA Verification (Cloudflare Turnstile)

Prevents automated bot voting

Blocks script-based spam attacks

Ensures only human users can submit votes

Verification is performed server-side

This eliminates large-scale automated manipulation.

2. Browser-Based Voter ID

Each browser receives a unique UUID

Stored in localStorage

Sent with every vote request

Prevents:

Refresh-and-vote-again attempts

Closing and reopening the tab to vote again

Multiple votes from the same browser

3. IP Address Tracking

Server captures the user's IP address

Stored along with the vote

Prevents:

Voting multiple times using different browsers

Basic bypass attempts

While IP validation alone is not perfect, it significantly strengthens fairness when combined with voter ID tracking.

4. Database-Level Unique Constraints

Enforced directly in PostgreSQL

Prevents duplicate votes per poll

Protects against manual API manipulation

Even if frontend validation is bypassed, the database rejects duplicate entries.

This guarantees data integrity at the strongest level.

5. Server-Side Validation

All vote logic is handled inside a secure API route:

Required fields are validated

CAPTCHA token is verified

Duplicate checks are performed

Vote is inserted only after validation

No direct client-side database access is allowed.

Environment Variables

Create a .env.local file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key


These must also be configured in Vercel for production deployment.

Installation

Clone the repository:

git clone https://github.com/divenhinduja27/Votely.git
cd votely
npm install
npm run dev


The application will run at:

http://localhost:3000

Deployment

The project is deployed using Vercel.

Steps:

Push code to GitHub

Import repository into Vercel

Configure environment variables

Deploy

Vercel automatically builds and deploys on every push to the main branch.

Future Improvements

Poll expiration timer

User authentication

Admin analytics dashboard

Poll privacy settings

Social sharing integration

Dark mode support

Author

Built by Diven Hinduja.