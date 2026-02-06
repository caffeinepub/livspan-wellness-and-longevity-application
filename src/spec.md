# Specification

## Summary
**Goal:** Redesign routine input controls across the Dashboard routine cards to match the luxury/glass dashboard style by replacing classic slider interactions with modern alternatives (dials, steppers, segmented/chip controls) without changing data behavior.

**Planned changes:**
- Replace slider-based inputs in Fasting, Sleep, Nutrition, Stress/Vitals, and Body Composition cards with dashboard-styled controls while preserving the same min/max/step constraints and existing state/localStorage + Save Daily Routine flow.
- Apply the existing ChronographDial as the primary control for at least two routine fields where a circular dial fits the aesthetic (with mouse/touch support and step snapping).
- Introduce and reuse shared input primitives (e.g., StepperInput, SegmentedControl/Chips) across multiple cards to avoid ad-hoc UI duplication and to keep interactions consistent.
- Ensure new user-facing strings added for these controls are in English and that the updated controls remain visually aligned with the current dashboard theme (no unstyled HTML inputs).

**User-visible outcome:** Users can edit all routine values on the Dashboard using modern, dashboard-matching controls (dials/steppers/segments/chips) instead of sliders, with the same ranges, steps, calculations, and save behavior as before.
