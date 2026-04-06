# Login & Register Redesign

## Summary

Restyle the Login and Register pages to match the new visual identity. Full-screen dark map as a living background with a centered glass card containing the auth form.

## Layout

Both pages share the same structure:

- **Background:** Full-screen static map using CartoDB dark tiles (`dark_all`). No markers, no interactivity, no zoom controls. Centered on the default `mapCenter` fallback (40.73, -73.99). The map is purely decorative.
- **Overlay:** Centered glass card, vertically and horizontally centered on the viewport. Max width ~400px, responsive padding.

## Glass Card

- Background: `rgba(255,255,255,0.08)` with `backdrop-blur-[24px] backdrop-saturate-[180%]`
- Border: `1px solid rgba(255,255,255,0.12)`
- Border radius: `rounded-2xl`
- Shadow: `0 8px 32px rgba(0,0,0,0.3)`
- Padding: generous internal padding (`px-8 py-10`)

### Card Contents (top to bottom)

1. **Logo:** "LATERAL COURTZ" in Lixdu font, centered, `text-[22px]`, `tracking-[3px]`, `text-[rgba(255,255,255,0.85)]`
2. **Subtitle:** "Sign in to your account" / "Create your account" in Square Sans Serif 7, `text-[10px]`, uppercase, `tracking-[2px]`, `text-[rgba(255,255,255,0.4)]`, margin below logo
3. **Form inputs** (see below)
4. **Submit button:** Full-width, `bg-[#ff3b30]`, `rounded-xl`, Square Sans Serif 7 font, `text-[12px]`, uppercase, `tracking-[2px]`, white text. Hover: brighter shadow. Loading state: "Signing in..." / "Creating account..."
5. **Error message:** Below button, `text-[#ff3b30]`, `text-[12px]`, centered
6. **Toggle link:** "Don't have an account? Register" / "Already have an account? Sign in" in Square Sans Serif 7, `text-[10px]`, `text-[rgba(255,255,255,0.4)]`, centered, link portion in `text-[rgba(255,255,255,0.7)]` with hover

### Form Inputs

Glass-style inputs matching the Discover search bar:

- Background: `rgba(255,255,255,0.06)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border radius: `rounded-xl`
- Padding: `px-4 py-3`
- Text: white, `text-[14px]`
- Placeholder: `text-[rgba(255,255,255,0.3)]`, Square Sans Serif 7, `text-[11px]`, uppercase, `tracking-[1.5px]`
- Focus state: border changes to `rgba(255,255,255,0.25)`
- Spacing: `gap-3` between inputs

### Login Fields

1. Email
2. Password

### Register Fields

1. Name
2. Email
3. Password

## Fonts

| Element | Font | Size | Style |
|---------|------|------|-------|
| Logo | Lixdu | 22px | uppercase, tracking 3px |
| Subtitle | Square Sans Serif 7 | 10px | uppercase, tracking 2px |
| Input placeholder | Square Sans Serif 7 | 11px | uppercase, tracking 1.5px |
| Input value | Inter (body default) | 14px | normal |
| Button | Square Sans Serif 7 | 12px | uppercase, tracking 2px |
| Toggle link | Square Sans Serif 7 | 10px | uppercase, tracking 1.5px |
| Error message | Square Sans Serif 7 | 12px | normal |

## Files to Modify

- `client/src/pages/Login.tsx` — full rewrite of JSX and styling
- `client/src/pages/Register.tsx` — full rewrite of JSX and styling

No new components needed. The map background is a simple static `<MapContainer>` with a dark tile layer — no shared component extraction required since it's just a few lines of Leaflet setup duplicated across two files.
