# Profile Arrays Fix Script

## Problem
Some learner profiles may have `education` and `experience` fields stored as empty strings (`""`) instead of empty arrays (`[]`). This causes a TypeError when trying to add education or experience entries:

```
TypeError: Cannot create property 'degree' on string ''
```

## Solution
This script migrates all affected profiles to ensure `education` and `experience` are properly initialized as arrays.

## Usage

Run the migration script:

```bash
cd backend
npm run fix:profiles
```

## What it does
1. Connects to MongoDB
2. Finds all profiles where `education` or `experience` are:
   - Strings instead of arrays
   - Missing/undefined
3. Updates those fields to empty arrays `[]`
4. Reports the number of profiles fixed

## When to run
- After upgrading the codebase if you experience the TypeError
- When setting up an existing database with the new code
- As a one-time migration (safe to run multiple times)

## Safety
- The script only updates profiles that need fixing
- It preserves all other profile data
- Safe to run multiple times (idempotent)
