# Quality of Life

This document tracks improvements that make CSUA Intrams easier, faster, and safer to use during event preparation and live competitions.

## Goals

- Reduce repetitive data entry.
- Make schedules, standings, and results easy to scan.
- Prevent accidental loss or overwriting of data.
- Keep common actions usable on phones and smaller screens.
- Give administrators clear feedback when an action succeeds or fails.

## Priority Improvements

### High Priority

- [ ] Add loading, success, and error states to every API-backed action.
- [ ] Confirm destructive actions before deleting schedules, sports, users, or standings.
- [ ] Add search and filtering for colleges, users, sports, and schedule entries.
- [ ] Add a clear empty state when no records are available.
- [ ] Preserve unsaved form data when validation fails or an API request is interrupted.
- [x] Make standings and schedules responsive for mobile screens.
- [ ] Show the last updated time for schedules and standings.

### Medium Priority

- [ ] Add duplicate detection for college, sport, event, and user records.
- [ ] Allow administrators to export standings and schedules as CSV.
- [ ] Add pagination for long user, schedule, and results lists.
- [ ] Add keyboard-friendly form navigation and visible focus states.
- [ ] Provide inline validation messages before submitting forms.
- [ ] Add a refresh action for live schedules and standings.
- [ ] Display the current user's role and assigned sports clearly.

### Lower Priority

- [ ] Add an activity history for important changes.
- [ ] Add configurable scoring rules instead of hard-coded values.
- [ ] Add print-friendly schedule and standings views.
- [ ] Add a compact display mode for event staff.
- [ ] Add optional automatic refresh during live events.

## Reliability and Safety

- Use the Laravel API for all application data and keep MySQL as the only data store.
- Never expose database credentials in the Angular application.
- Validate permissions on the Laravel API, not only in the frontend.
- Hash passwords using Laravel's authentication tools.
- Return consistent error responses so the frontend can explain failures clearly.
- Back up the production MySQL database before major events.

## Definition of Done

A quality-of-life improvement is complete when:

- The common workflow is faster or clearer than before.
- The interface works on desktop and mobile layouts.
- Loading, success, empty, and error states are handled.
- Permission and data validation are enforced by the API where applicable.
- A focused test or manual verification confirms the behavior.
