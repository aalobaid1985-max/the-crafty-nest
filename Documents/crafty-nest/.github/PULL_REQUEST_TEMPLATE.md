## What does this PR do?

<!-- One or two sentences describing the change -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Chore / dependency update

## Checklist

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run lint` passes
- [ ] Tested in browser (Arabic RTL layout)
- [ ] KWD amounts display with 3 decimal places
- [ ] No `select('*')` — all Supabase queries name columns explicitly
- [ ] No `any` types introduced
- [ ] Admin panel still works if touching order/inventory logic
