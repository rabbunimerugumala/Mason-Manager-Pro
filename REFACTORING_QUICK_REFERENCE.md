# Refactoring Quick Reference

## 🗑️ Files to Delete (Safe)

```
src/ai/                          # Entire folder - unused
src/firebase/non-blocking-login.tsx
src/lib/placeholder-images.ts
src/lib/placeholder-images.json
src/firebase/non-blocking-updates.tsx  # After replacing usages
```

## 📦 Dependencies to Remove

```json
{
  "dependencies": {
    "genkit": "❌",
    "@genkit-ai/google-genai": "❌",
    "@genkit-ai/next": "❌",
    "react-phone-input-2": "❌",
    "dotenv": "❌",
    "recharts": "❌"  // If chart.tsx deleted
  },
  "devDependencies": {
    "genkit-cli": "❌"
  }
}
```

## 🔄 Replacements Needed

### Replace `useMemoFirebase` → `useMemo`
```typescript
// Before
const ref = useMemoFirebase(() => doc(...), [deps]);

// After
const ref = useMemo(() => doc(...), [deps]);
```

### Replace `*NonBlocking` → Standard Firebase
```typescript
// Before
addDocumentNonBlocking(collectionRef, data);

// After
addDoc(collectionRef, data).catch((error) => {
  toast({ variant: 'destructive', title: 'Error', description: error.message });
});
```

## 📁 Files to Create

```
src/app/error.tsx
src/app/global-error.tsx
src/app/sites/error.tsx
src/app/sites/loading.tsx
src/app/places/[id]/error.tsx
src/app/places/[id]/loading.tsx
src/lib/constants.ts
```

## 🔍 Files to Refactor (Large Components)

- `src/app/places/[id]/page.tsx` (368 lines) → Split into sub-components
- `src/app/page.tsx` (304 lines) → Consider extracting auth logic

## ✅ Priority Order

1. **Phase 1:** Delete unused files (1-2 hours)
2. **Phase 2:** Simplify Firebase (2-3 hours)
3. **Phase 3:** Simplify useMemoFirebase (30 min)
4. **Phase 4:** Add Next.js patterns (1 hour)
5. **Phase 5:** Code quality (1 hour)

**Total: 4-6 hours**

