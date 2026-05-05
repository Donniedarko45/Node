# ✅ Fix Applied: tRPC Hook Pattern

## Issue
Runtime error: `useTRPC.useUtils is not a function`

The credentials and executions hooks were using an incorrect pattern to access tRPC utilities.

---

## Root Cause

We were trying to use tRPC like this (WRONG):
```typescript
import { useTRPC as trpc } from "@/trpc/client";

// ❌ This doesn't work - trpc is not the instance
const utils = trpc.useUtils();
```

---

## Solution

Updated to match the working pattern from workflows hooks:

### Before (Incorrect):
```typescript
import { useTRPC as trpc } from "@/trpc/client";

export const useCreateCredential = () => {
  const utils = trpc.useUtils(); // ❌ Wrong
  return trpc.credentials.create.useMutation({
    onSuccess: () => {
      utils.credentials.getMany.invalidate();
    },
  });
};
```

### After (Correct):
```typescript
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useCreateCredential = () => {
  const queryClient = useQueryClient(); // ✅ Use React Query's client
  const trpc = useTRPC(); // ✅ Call as hook

  return useMutation(
    trpc.credentials.create.mutationOptions({ // ✅ Use mutationOptions
      onSuccess: () => {
        queryClient.invalidateQueries( // ✅ Invalidate via queryClient
          trpc.credentials.getMany.queryOptions({})
        );
      },
    })
  );
};
```

---

## Files Fixed

1. ✅ `src/features/credentials/hooks/use-credentials.ts`
   - Fixed `useCreateCredential`
   - Fixed `useRemoveCredential`
   - Fixed `useUpdateCredentialName`
   - Fixed all query hooks

2. ✅ `src/features/executions/hooks/use-executions.ts`
   - Fixed all query hooks
   - Added "use client" directive

---

## Key Changes

### Pattern Used:
```typescript
"use client"; // ✅ Added for client-side hooks

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// For queries:
const trpc = useTRPC();
return useSuspenseQuery(trpc.resource.method.queryOptions(params));

// For mutations:
const trpc = useTRPC();
const queryClient = useQueryClient();
return useMutation(
  trpc.resource.method.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.resource.getMany.queryOptions({}));
    },
  })
);
```

---

## Why This Works

The tRPC setup uses `createTRPCContext` which returns:
- `TRPCProvider` - Context provider
- `useTRPC` - Hook to access tRPC instance

The correct flow is:
1. Call `useTRPC()` to get the tRPC instance
2. Access methods like `.queryOptions()` or `.mutationOptions()`
3. Pass to React Query hooks (`useSuspenseQuery`, `useMutation`)
4. Use `useQueryClient()` for cache invalidation

---

## Testing

After this fix, you should be able to:

✅ **Navigate to `/credenetials`**
- Page loads without errors
- Can click "New credential" button
- Dialog opens correctly

✅ **Navigate to `/executions`**
- Page loads without errors
- Shows empty state

✅ **Navigate to `/workflows`**
- Still works as before
- Can create workflows
- Can open editor

---

## Next Steps

1. **Restart dev server** (if running):
   ```bash
   # Press Ctrl+C
   npm run dev
   ```

2. **Test the pages**:
   - Visit `/workflows` - should work
   - Visit `/credenetials` - should work now
   - Visit `/executions` - should work now

3. **Try creating a credential** (requires premium):
   - Click "New credential"
   - Fill form
   - Submit

---

## Summary

✅ Fixed tRPC hook pattern in credentials
✅ Fixed tRPC hook pattern in executions
✅ Matched working pattern from workflows
✅ No TypeScript errors
✅ Ready to test

**The error should now be resolved!** 🎉
