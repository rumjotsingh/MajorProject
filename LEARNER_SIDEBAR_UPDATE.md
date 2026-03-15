# Learner Sidebar Update - Hide "Join Institute" After Joining

## What Was Done

Created a utility function that conditionally shows/hides the "Join Institute" menu item based on whether the learner has already joined an institute.

## Files Created/Modified

### 1. Created: `frontend/lib/learnerSidebarItems.ts`
Utility function that generates sidebar items dynamically:
- Shows "Join Institute" only if `hasJoinedInstitute === false`
- Always shows: Dashboard, Credentials, Pathways, Profile

### 2. Updated: `frontend/app/learner/dashboard/page.tsx`
- Imports `getLearnerSidebarItems` utility
- Checks `profile?.user?.instituteId` to determine if joined
- Dynamically generates sidebar items

### 3. Updated: `frontend/app/learner/credentials/page.tsx`
- Same pattern as dashboard
- Fetches profile on mount
- Uses dynamic sidebar items

## How It Works

```typescript
// Check if learner has joined
const hasJoinedInstitute = !!profile?.user?.instituteId

// Get sidebar items (Join Institute hidden if already joined)
const sidebarItems = getLearnerSidebarItems(hasJoinedInstitute)
```

## Files That Need Same Update

Apply the same pattern to these files:

1. `frontend/app/learner/pathways/page.tsx`
2. `frontend/app/learner/profile/page.tsx`
3. `frontend/app/learner/add-credential/page.tsx`
4. `frontend/app/learner/my-pathway/page.tsx`
5. `frontend/app/learner/join-institute/page.tsx`

## Update Pattern

For each file:

1. **Import the utility:**
```typescript
import { getLearnerSidebarItems } from '@/lib/learnerSidebarItems'
import { getLearnerProfile } from '@/lib/slices/learnerSlice'
```

2. **Remove hardcoded sidebar:**
```typescript
// DELETE THIS:
const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/learner/dashboard' },
  { icon: FileText, label: 'Credentials', path: '/learner/credentials' },
  { icon: Compass, label: 'Pathways', path: '/learner/pathways' },
  { icon: Building2, label: 'Join Institute', path: '/learner/join-institute' },
  { icon: User, label: 'Profile', path: '/learner/profile' },
]
```

3. **Add profile to state:**
```typescript
const { profile, loading } = useAppSelector((state) => state.learner)
```

4. **Fetch profile in useEffect:**
```typescript
useEffect(() => {
  // ... existing dispatches
  dispatch(getLearnerProfile())
}, [dispatch])
```

5. **Generate dynamic sidebar:**
```typescript
const hasJoinedInstitute = !!profile?.user?.instituteId
const sidebarItems = getLearnerSidebarItems(hasJoinedInstitute)
```

## Testing

1. **Before Joining:**
   - Login as new learner
   - Sidebar should show "Join Institute"
   - Click to join an institute

2. **After Joining:**
   - Refresh page or navigate
   - "Join Institute" should disappear from sidebar
   - All other menu items remain

3. **Navigation:**
   - Can still access `/learner/join-institute` via URL
   - But it's hidden from sidebar menu

## Benefits

- Cleaner UI after joining
- Reduces confusion
- Learner knows they've already joined
- Can still manually navigate to join page if needed
- Consistent across all learner pages

## Future Enhancement

Consider adding:
- "Switch Institute" option (if allowed)
- Show current institute name in sidebar
- Institute badge/icon next to profile
