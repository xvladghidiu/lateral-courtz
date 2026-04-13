import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SECTION_DOT = "absolute -left-[29px] top-[3px] w-[14px] h-[14px] rounded-full bg-[rgba(212,160,18,0.3)] border-2 border-[#d4a012]";
const SECTION_TITLE = "font-['Lixdu',sans-serif] text-[20px] uppercase tracking-[3px] text-white mb-4";
const CARD = "bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 mb-4";
const CODE_BLOCK = "bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 font-mono text-[13px] text-[rgba(255,255,255,0.8)] overflow-x-auto whitespace-pre";
const LABEL = "font-['Space_Grotesk',sans-serif] text-[10px] font-semibold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] mb-2";
const BODY = "font-['Space_Grotesk',sans-serif] text-[13px] text-[rgba(255,255,255,0.6)] leading-relaxed";
const PILL = "inline-block bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1px] text-[rgba(255,255,255,0.6)]";
const TABLE_HEAD = "font-['Space_Grotesk',sans-serif] text-[10px] font-semibold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] text-left pb-2 border-b border-[rgba(255,255,255,0.08)]";
const TABLE_CELL = "font-['Space_Grotesk',sans-serif] text-[12px] text-[rgba(255,255,255,0.7)] py-2.5 border-b border-[rgba(255,255,255,0.06)]";
const TABLE_CODE = "font-mono text-[12px] text-[rgba(255,255,255,0.8)]";

const NAV_SECTIONS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "features", label: "Features" },
  { id: "design-system", label: "Design System" },
  { id: "loading-states", label: "Loading States" },
  { id: "error-handling", label: "Error Handling" },
  { id: "api-reference", label: "API Reference" },
  { id: "tech-stack", label: "Tech Stack" },
  { id: "data-model", label: "Data Model" },
  { id: "project-structure", label: "Project Structure" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="relative mb-10 scroll-mt-8">
      <div className={SECTION_DOT} />
      <h2 className={SECTION_TITLE}>{title}</h2>
      {children}
    </div>
  );
}

function FeatureCard({ title, description, details }: { title: string; description: string; details: string[] }) {
  return (
    <div className={CARD}>
      <div className="font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[2px] text-white mb-2">{title}</div>
      <p className={`${BODY} mb-3`}>{description}</p>
      <ul className="list-none space-y-1.5">
        {details.map((d, i) => (
          <li key={i} className={`${BODY} flex items-start gap-2`}>
            <span className="text-[#d4a012] text-[10px] mt-1">&#9679;</span>
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EndpointRow({ method, path, description, auth }: { method: string; path: string; description: string; auth?: boolean }) {
  const methodColor = method === "GET" ? "text-[rgba(100,220,140,0.8)]" : "text-[rgba(255,200,100,0.8)]";
  return (
    <tr>
      <td className={`${TABLE_CELL} ${methodColor} font-mono font-bold`}>{method}</td>
      <td className={`${TABLE_CELL} ${TABLE_CODE}`}>{path}</td>
      <td className={TABLE_CELL}>{description}</td>
      <td className={TABLE_CELL}>{auth ? <span className="text-[#d4a012]">&#9679;</span> : ""}</td>
    </tr>
  );
}

function TypeBlock({ name, fields }: { name: string; fields: string }) {
  return (
    <div className={CARD}>
      <div className="font-['Lixdu',sans-serif] text-[13px] uppercase tracking-[2px] text-[#d4a012] mb-3">{name}</div>
      <div className={CODE_BLOCK}>{fields}</div>
    </div>
  );
}

function SideNav({ active }: { active: string }) {
  return (
    <nav className="fixed left-0 top-0 bottom-0 w-[220px] z-[3] bg-[rgba(10,10,12,0.95)] border-r border-[rgba(255,255,255,0.06)] pt-6 pb-8 px-5 flex flex-col overflow-y-auto hidden lg:flex">
      <Link
        to="/"
        className="font-['Grize_Sports',sans-serif] text-[22px] uppercase tracking-[3px] text-[rgba(255,255,255,0.7)] mb-1 no-underline"
      >
        Lateral
      </Link>
      <span className="font-['Space_Grotesk',sans-serif] text-[9px] uppercase tracking-[2px] text-[rgba(255,255,255,0.3)] mb-8">
        Documentation
      </span>

      <div className="flex flex-col gap-1 flex-1">
        {NAV_SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] px-3 py-2 rounded-lg transition-all no-underline ${
                isActive
                  ? "bg-[rgba(212,160,18,0.15)] border border-[rgba(212,160,18,0.3)] text-[#d4a012]"
                  : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              {s.label}
            </a>
          );
        })}
      </div>

      <Link
        to="/"
        className="mt-4 text-center text-white rounded-xl px-4 py-3 font-['Lixdu',sans-serif] text-[11px] uppercase tracking-[2px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all no-underline"
        style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        Back to Courts
      </Link>
    </nav>
  );
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const contentRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    if (!contentRef.current) return;
    const scrollTop = contentRef.current.scrollTop + 100;
    for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
      const el = document.getElementById(NAV_SECTIONS[i]!.id);
      if (el && el.offsetTop <= scrollTop) {
        setActiveSection(NAV_SECTIONS[i]!.id);
        return;
      }
    }
  }

  return (
    <div className="fixed inset-0 text-white z-10">
      <div className="fixed inset-0 z-0">
        <MapContainer
          center={[40.73, -73.99]}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          className="w-full h-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        </MapContainer>
      </div>
      <div className="fixed inset-0 z-[1] bg-[rgba(10,10,12,0.88)]" />

      <SideNav active={activeSection} />

      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="relative z-[2] h-full overflow-y-auto lg:ml-[220px]"
      >
        <div className="max-w-[860px] mx-auto px-4 md:px-8 pt-6 pb-20">
          <Link
            to="/"
            className="inline-block lg:hidden font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors mb-8"
          >
            &#8592; Back to Courts
          </Link>

          {/* Hero */}
          <div className="text-center mb-14">
            <span className="text-[64px] block mb-4">🏀</span>
            <h1 className="font-['Grize_Sports',sans-serif] text-[48px] uppercase tracking-[6px] text-white mb-3">
              Lateral Courts
            </h1>
            <p className="font-['Space_Grotesk',sans-serif] text-[14px] text-[rgba(255,255,255,0.4)] tracking-[1px]">
              Documentation & Feature Guide
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <span className={PILL}>React 19</span>
              <span className={PILL}>Fastify 5</span>
              <span className={PILL}>TypeScript</span>
              <span className={PILL}>Tailwind v4</span>
              <span className={PILL}>Leaflet</span>
            </div>
          </div>

          {/* Timeline content */}
          <div className="relative pl-8">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[rgba(255,255,255,0.08)]" />

            <Section id="getting-started" title="Getting Started">
              <div className={CARD}>
                <div className={LABEL}>Prerequisites</div>
                <p className={`${BODY} mb-4`}>Node.js &gt;= 20 and npm &gt;= 10</p>

                <div className={LABEL}>Install & Run</div>
                <div className={`${CODE_BLOCK} mb-4`}>{`# Install all dependencies (root + client + server + shared)
npm install

# Start both client and server in dev mode
npm run dev`}</div>

                <div className={LABEL}>Ports</div>
                <div className="flex gap-6 mb-4">
                  <div>
                    <span className="font-['DSEG',monospace] text-[20px] text-white">5173</span>
                    <span className={`${BODY} ml-2`}>Client (Vite)</span>
                  </div>
                  <div>
                    <span className="font-['DSEG',monospace] text-[20px] text-white">3001</span>
                    <span className={`${BODY} ml-2`}>Server (Fastify)</span>
                  </div>
                </div>
                <p className={`${BODY} mb-4`}>
                  Vite proxies <code className="text-white">/api/*</code> to the server automatically.
                </p>

                <div className={LABEL}>Environment Variables (optional)</div>
                <div className={CODE_BLOCK}>{`PORT=3001                          # Server port
JWT_SECRET=lateral-courts-dev...   # JWT signing key
AUTO_CANCEL_OFFSET_HOURS=2         # Auto-confirm offset`}</div>
              </div>

              <div className={CARD}>
                <div className={LABEL}>Seed Data</div>
                <p className={`${BODY} mb-3`}>
                  No database required. The server uses in-memory repositories seeded automatically from JSON files on startup:
                </p>
                <ul className="list-none space-y-1.5">
                  <li className={`${BODY} flex items-start gap-2`}><span className="text-[#d4a012] text-[10px] mt-1">&#9679;</span><code className="text-white">courts.json</code> — 16 courts across NYC and Cluj-Napoca</li>
                  <li className={`${BODY} flex items-start gap-2`}><span className="text-[#d4a012] text-[10px] mt-1">&#9679;</span><code className="text-white">users.json</code> — Pre-seeded user accounts</li>
                  <li className={`${BODY} flex items-start gap-2`}><span className="text-[#d4a012] text-[10px] mt-1">&#9679;</span><code className="text-white">sessions.json</code> — Sample game sessions</li>
                  <li className={`${BODY} flex items-start gap-2`}><span className="text-[#d4a012] text-[10px] mt-1">&#9679;</span><code className="text-white">reviews.json</code> — Sample reviews</li>
                </ul>
                <p className={`${BODY} mt-3`}>
                  Data resets on server restart. No seed commands needed.
                </p>
              </div>

              <div className={CARD}>
                <div className={LABEL}>Other Commands</div>
                <div className={CODE_BLOCK}>{`npm run build        # Production build (server + client)
npm test             # Run all tests (Vitest)
npm run typecheck    # Type-check both packages
npm run lint         # Lint all .ts/.tsx files`}</div>
              </div>
            </Section>

            <Section id="features" title="Features">
              <FeatureCard
                title="Court Discovery"
                description="Interactive Leaflet map with 16 basketball courts across NYC and Cluj-Napoca."
                details={[
                  "Custom basketball pin markers with hover tooltips (name, price, rating, type, surface, address)",
                  "Compact tooltip cards (420px) with word-wrapping titles and click-to-navigate",
                  "4 map tile styles: Dark (default), Color (Voyager), Light, Satellite — switcher in bottom-left",
                  "User geolocation: requests browser permission on load, shows user position marker on map",
                  "Permission listener: if the user grants location later (without refresh), the map updates automatically",
                  "Auto-fly: when geolocation is denied, the map automatically flies to the nearest court cluster so users always see courts",
                  "'Discover Courts' leather button: tapping it flies the map to the nearest cluster of courts around the user's location (or the default cluster if location is off)",
                  "Flying animation: spinning basketball overlay with backdrop blur during all map fly animations (search, discover)",
                  "Smart bottom bar shows live DSEG stats: total players playing, active sessions, nearby courts",
                  "When location is off, the bottom bar shows: 'Please enable your location for nearby courts'",
                  "Vertical 'LATERAL' branding on the left side in Grize Sports font",
                ]}
              />
              <FeatureCard
                title="Search"
                description="Address/neighborhood search with Nominatim geocoding and local court matching."
                details={[
                  "350ms debounced Nominatim API calls for location search",
                  "Instant local court name/address substring matching (case-insensitive)",
                  "Nearby court detection: courts within ~50km of Nominatim results",
                  "Categorized dropdown: Courts section (basketball icons) + Locations section (pin icons)",
                  "Flying basketball overlay during map navigation animations",
                ]}
              />
              <FeatureCard
                title="Booking Flow"
                description="4-step wizard: Date/Time, Options, Payment, Success — all over a dark map background."
                details={[
                  "Step 1: Calendar date picker with min-date validation (today) + time slot selection",
                  "Step 2: Duration (30/60/90/120 min), Format (5v5 = 10 players / 3v3 = 6 players), Mode (Open Game / Private Full Court)",
                  "Step 3: Side-by-side payment form — booking summary on the left, card form on the right (stacks on mobile)",
                  "Step 4: Success celebration with spinning basketball (2s animation) + court name + date/time confirmation",
                  "Step dots indicator: 3 dots (success excluded), active dot is wider and bright white",
                  "Back navigation from any step, court name shown in top bar",
                  "Automatic price calculation: pricePerHour x (duration / 60) per player",
                  "Container width expands from 540px to 720px on the payment step to fit side-by-side layout",
                ]}
              />
              <FeatureCard
                title="Payment (Mock)"
                description="Client-side only payment form — no real processor. Ready to swap in Stripe."
                details={[
                  "Card number: auto-formatting (groups of 4 with spaces), Luhn algorithm validation",
                  "Brand detection: Visa (starts with 4), Mastercard (51-55), Amex (34/37) — shown as label at right edge of input",
                  "Expiry: MM/YY auto-slash formatting, validates month (01-12) and checks not in the past",
                  "CVV: 3-digit masked input (type=password)",
                  "Cardholder name: free text, required (non-empty)",
                  "Validation on blur: invalid fields get red border, Pay button disabled until all 4 fields pass",
                  "1.5s simulated processing delay with 'Processing...' disabled state, then creates the session",
                  "Timer cleanup on unmount (useRef + useEffect) to prevent stale callbacks",
                  "28 unit tests in cardUtils.test.ts covering formatting, brand detection, Luhn, expiry, CVV",
                ]}
              />
              <FeatureCard
                title="Reviews & Ratings"
                description="Star ratings with visual distribution breakdown and user comments."
                details={[
                  "1-5 star rating selector with clickable number buttons",
                  "Gold accent (#d4a012) for filled stars and rating bars",
                  "Rating breakdown: horizontal bar chart showing count per star level",
                  "Large DSEG-styled average rating number (36px)",
                  "Individual review rows: star count, username (first 8 chars of ID), date, comment text",
                  "Review form: star selector + textarea, auth required (shows login link if not authenticated)",
                  "TanStack Query cache invalidation on successful review post",
                ]}
              />
              <FeatureCard
                title="Authentication"
                description="JWT-based auth with persistent sessions via localStorage."
                details={[
                  "Register: name, email, password fields with glass morphism card over dark map background",
                  "Login: email/password with redirect to the route the user came from",
                  "JWT token stored as 'lateral_courts_token' in localStorage, auto-loaded on page refresh",
                  "Auth context provides user state, login/logout/register functions to all components",
                  "Protected routes: creating sessions, joining sessions, posting reviews, viewing bookings",
                  "Basketball avatar: user's initial letter overlaid on basketball emoji (Lixdu font, drop shadow)",
                  "Rolling logout: click avatar → basketball rolls left (-180px, 720° rotation), 'Log Out' pill fades in",
                  "Bookings nav link hides when logout menu is open, reappears when closed",
                ]}
              />
              <FeatureCard
                title="Bookings Timeline"
                description="Rich timeline view of user bookings grouped by date."
                details={[
                  "Gold vertical timeline line with 14px gold-bordered dots at each date group",
                  "Date headers: uppercase Space Grotesk labels (e.g., 'APR 23')",
                  "Booking cards: Leaflet map thumbnail (self-stretching height), court name (Lixdu), time + duration, format/player pills, DSEG price",
                  "Clicking a card navigates to the court details page",
                  "Upcoming/Past tab toggle with gold accent active state, tabs filter by session date vs today",
                  "Empty state: spinning basketball + descriptive message + leather 'Explore Courts' CTA button",
                  "Dark map background (fixed, non-scrolling) with semi-transparent overlay",
                  "Auth redirect: unauthenticated users sent to /login automatically",
                ]}
              />
              <FeatureCard
                title="Court Details"
                description="Full court page with photo carousel, reviews, booking sidebar, and expandable location map."
                details={[
                  "Photo carousel: 3 basketball Unsplash photos per court, 240px (mobile) / 320px (desktop) height",
                  "Carousel navigation: prev/next arrows appear on hover, dot indicators with active state",
                  "Click-to-expand lightbox: fullscreen dark overlay with larger arrows, bigger dots, close button (x) or click backdrop",
                  "Court header: Lixdu name, address, type/surface pills, star rating with gold stars, amenity pills",
                  "Two-column desktop layout: main content left, sticky booking sidebar (420px) right",
                  "Booking sidebar: DSEG price display, leather 'Book Full Court' CTA button",
                  "Mobile: stacked layout with fixed bottom booking bar",
                  "Expandable location map: small 140px thumbnail with basketball pin marker, click to open fullscreen interactive Leaflet map with zoom controls",
                  "Dark map background centered on the court's coordinates",
                  "Loading state: spinning basketball, Error state: 'Not Found' with leather CTA",
                ]}
              />
              <FeatureCard
                title="404 / Not Found"
                description="Custom error pages matching the app's visual language."
                details={[
                  "Catch-all route (*): dark map background, spinning basketball, '404' in Lixdu (48px), subtitle, leather CTA",
                  "Court not found: basketball emoji (static), 'Not Found' title, 'This court doesn't exist', leather 'Back to Courts' button",
                  "Explicit '/' route prevents the 404 from matching the home page (Discover is always mounted outside Routes)",
                ]}
              />
              <FeatureCard
                title="Documentation (this page)"
                description="In-app documentation page with full feature inventory."
                details={[
                  "Basketball hoop icon on the Discover map (bottom-left) links to /docs",
                  "Fixed left sidebar navigation with scroll-aware active section highlighting",
                  "Gold timeline layout matching the bookings page pattern",
                  "Covers: setup, features, design system, loading states, error handling, API, tech stack, data model, project structure",
                  "Responsive: sidebar hidden on mobile, full-width content",
                ]}
              />
            </Section>

            <Section id="design-system" title="Design System">
              <FeatureCard
                title="Glass Morphism"
                description="Frosted glass cards and inputs used throughout the app."
                details={[
                  "Dark variant: bg-[rgba(255,255,255,0.08)] backdrop-blur-[24px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.12)]",
                  "Used in: search bar, login/register cards, booking sidebar, tooltip cards, tab toggles",
                  "Inputs: bg-[rgba(255,255,255,0.04-0.06)] with subtle borders, focus state brightens border",
                ]}
              />
              <FeatureCard
                title="Typography"
                description="Four custom fonts for different purposes."
                details={[
                  "Grize Sports: vertical 'LATERAL' branding (80px, writing-mode vertical-rl)",
                  "Lixdu: all headings, button text, court names (uppercase, 2-4px letter-spacing)",
                  "DSEG: seven-segment monospace for prices, stats, port numbers (16-28px, bold)",
                  "Space Grotesk: body text, labels, metadata, form placeholders (10-14px, various weights)",
                ]}
              />
              <FeatureCard
                title="Color Palette"
                description="Dark theme with gold accents."
                details={[
                  "Background: #0a0a0c (pages) / #1a1a1e (loading)",
                  "Text primary: rgba(255,255,255,0.85-0.9)",
                  "Text muted: rgba(255,255,255,0.35-0.4)",
                  "Accent gold: #d4a012 — ratings, active tabs, timeline dots, status highlights",
                  "Status green: rgba(100,220,140,0.8) — confirmed bookings",
                  "Status red: rgba(255,59,48) / rgba(255,100,100,0.8) — cancelled, validation errors",
                  "Status yellow: rgba(255,200,100,0.8) — filling sessions",
                  "Borders: rgba(255,255,255,0.06-0.15) — subtle glass edges",
                ]}
              />
              <FeatureCard
                title="Leather Texture Buttons"
                description="Primary action buttons use basketball leather background."
                details={[
                  "Background: basketball-leather.jpg with cover/center",
                  "Used for: Book, Pay, Explore Courts, Discover Courts, Sign In, Register, and CTAs throughout",
                  "Hover: orange glow shadow 0_4px_20px_rgba(232,120,23,0.4)",
                  "Text: Lixdu font, uppercase, white, 2-3px letter-spacing",
                ]}
              />
              <FeatureCard
                title="Animations"
                description="Custom CSS animations for basketball-themed interactions."
                details={[
                  "animate-ball-spin: continuous 1s linear rotation — loading spinners",
                  "animate-ball-roll: 0.4s ease-out translateX(-180px) + rotate(-720deg) — logout animation",
                  "animate-spin-slow: 2s cubic-bezier entrance spin with scale — success celebration",
                  "animate-fade-in-up: 0.6s ease-out translateY(12px) → 0 with opacity — step transitions",
                  "animate-float: 3s infinite ease-in-out vertical bob — floating UI elements",
                ]}
              />
              <FeatureCard
                title="Responsive Patterns"
                description="Mobile-first with desktop enhancements."
                details={[
                  "Mobile: BottomTabs navigation, MobileBookingBar (fixed footer), stacked layouts",
                  "Desktop (md:): two-column court details, side-by-side payment form, sidebar booking",
                  "Desktop (lg:): docs page sidebar navigation",
                  "Breakpoints: md (768px), lg (1024px) via Tailwind",
                ]}
              />
            </Section>

            <Section id="loading-states" title="Loading States">
              <div className={CARD}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[rgba(0,0,0,0.3)] rounded-lg p-4 text-center">
                    <span className="text-[40px] animate-ball-spin inline-block mb-2">🏀</span>
                    <div className={LABEL}>Geolocation Loading</div>
                    <p className={BODY}>Shown while waiting for browser location permission</p>
                  </div>
                  <div className="bg-[rgba(0,0,0,0.3)] rounded-lg p-4 text-center">
                    <span className="text-[40px] animate-ball-spin inline-block mb-2">🏀</span>
                    <div className={LABEL}>Map Flying</div>
                    <p className={BODY}>Backdrop blur overlay during fly animations</p>
                  </div>
                  <div className="bg-[rgba(0,0,0,0.3)] rounded-lg p-4 text-center">
                    <span className="text-[40px] animate-ball-spin inline-block mb-2">🏀</span>
                    <div className={LABEL}>Court Details Loading</div>
                    <p className={BODY}>Fullscreen spinner while fetching court data</p>
                  </div>
                  <div className="bg-[rgba(0,0,0,0.3)] rounded-lg p-4 text-center">
                    <div className="font-['Lixdu',sans-serif] text-[12px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-2">Processing...</div>
                    <div className={LABEL}>Payment Processing</div>
                    <p className={BODY}>1.5s simulated delay on Pay button</p>
                  </div>
                </div>
              </div>
            </Section>

            <Section id="error-handling" title="Error Handling & Fallbacks">
              <div className={CARD}>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={`${TABLE_HEAD} w-1/3`}>Scenario</th>
                      <th className={TABLE_HEAD}>Behavior</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className={`${TABLE_CELL} font-medium text-white`}>404 Route</td><td className={TABLE_CELL}>Basketball emoji + "This court doesn't exist... yet" + leather CTA</td></tr>
                    <tr><td className={`${TABLE_CELL} font-medium text-white`}>Court Not Found</td><td className={TABLE_CELL}>Basketball + "Not Found" title + "Back to Courts" button</td></tr>
                    <tr><td className={`${TABLE_CELL} font-medium text-white`}>Location Denied</td><td className={TABLE_CELL}>"Please enable your location" message, auto-fly to nearest cluster</td></tr>
                    <tr><td className={`${TABLE_CELL} font-medium text-white`}>Location Granted Later</td><td className={TABLE_CELL}>PermissionStatus listener auto-updates without refresh</td></tr>
                    <tr><td className={`${TABLE_CELL} font-medium text-white`}>Network Error (Search)</td><td className={TABLE_CELL}>Silent catch, keeps showing local court matches</td></tr>
                    <tr><td className={`${TABLE_CELL} font-medium text-white`}>Invalid Card</td><td className={TABLE_CELL}>Red border on blur, Pay button disabled until all fields valid</td></tr>
                    <tr><td className={`${TABLE_CELL} font-medium text-white`}>Empty Bookings</td><td className={TABLE_CELL}>Spinning basketball + message + "Explore Courts" CTA</td></tr>
                    <tr><td className={`${TABLE_CELL} font-medium text-white`}>No Photos</td><td className={TABLE_CELL}>Carousel hidden, court details still render</td></tr>
                    <tr><td className={`${TABLE_CELL} font-medium text-white`}>Not Authenticated</td><td className={TABLE_CELL}>Redirect to /login with return-to path preserved</td></tr>
                  </tbody>
                </table>
              </div>

              <div className={CARD}>
                <div className={LABEL}>404 Page Preview</div>
                <div className="bg-[rgba(0,0,0,0.4)] rounded-xl p-8 mt-3 border border-[rgba(255,255,255,0.06)]">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[56px] animate-ball-spin mb-4">🏀</span>
                    <div className="font-['Lixdu',sans-serif] text-[36px] uppercase tracking-[6px] text-white mb-2">404</div>
                    <p className="font-['Space_Grotesk',sans-serif] text-[13px] text-[rgba(255,255,255,0.4)] tracking-[1px] mb-6">
                      This court doesn't exist... yet.
                    </p>
                    <div
                      className="text-white rounded-xl px-6 py-3 font-['Lixdu',sans-serif] text-[12px] uppercase tracking-[2px]"
                      style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
                    >
                      Back to Courts
                    </div>
                  </div>
                </div>
              </div>

              <div className={CARD}>
                <div className={LABEL}>Court Not Found Preview</div>
                <div className="bg-[rgba(0,0,0,0.4)] rounded-xl p-8 mt-3 border border-[rgba(255,255,255,0.06)]">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[56px] mb-4">🏀</span>
                    <div className="font-['Lixdu',sans-serif] text-[28px] uppercase tracking-[4px] text-white mb-2">Not Found</div>
                    <p className="font-['Space_Grotesk',sans-serif] text-[13px] text-[rgba(255,255,255,0.4)] tracking-[1px] mb-6">
                      This court doesn't exist
                    </p>
                    <div
                      className="text-white rounded-xl px-6 py-3 font-['Lixdu',sans-serif] text-[12px] uppercase tracking-[2px]"
                      style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
                    >
                      Back to Courts
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <Section id="api-reference" title="API Reference">
              <div className={CARD}>
                <div className={LABEL}>Base URL: /api</div>
                <div className="overflow-x-auto">
                  <table className="w-full mt-3">
                    <thead>
                      <tr>
                        <th className={`${TABLE_HEAD} w-16`}>Method</th>
                        <th className={TABLE_HEAD}>Endpoint</th>
                        <th className={TABLE_HEAD}>Description</th>
                        <th className={`${TABLE_HEAD} w-10`}>Auth</th>
                      </tr>
                    </thead>
                    <tbody>
                      <EndpointRow method="POST" path="/auth/register" description="Create account" />
                      <EndpointRow method="POST" path="/auth/login" description="Get JWT token" />
                      <EndpointRow method="GET" path="/auth/me" description="Current user" auth />
                      <EndpointRow method="GET" path="/courts" description="Search/list courts" />
                      <EndpointRow method="GET" path="/courts/:id" description="Court details" />
                      <EndpointRow method="GET" path="/courts/:id/sessions" description="Sessions for court" />
                      <EndpointRow method="GET" path="/courts/:id/reviews" description="Reviews for court" />
                      <EndpointRow method="POST" path="/courts/:id/reviews" description="Add review" auth />
                      <EndpointRow method="GET" path="/sessions" description="List sessions" />
                      <EndpointRow method="POST" path="/sessions" description="Create session" auth />
                      <EndpointRow method="POST" path="/sessions/:id/join" description="Join session" auth />
                      <EndpointRow method="GET" path="/users/me/bookings" description="User's bookings" auth />
                      <EndpointRow method="GET" path="/users/me/sessions" description="User's sessions" auth />
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>

            <Section id="tech-stack" title="Tech Stack">
              <div className={CARD}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    ["React 19", "UI Framework"],
                    ["React Router 7", "Client Routing"],
                    ["TanStack Query 5", "Server State"],
                    ["Leaflet + react-leaflet", "Maps"],
                    ["Tailwind CSS 4", "Styling"],
                    ["Vite", "Build Tool"],
                    ["Fastify 5", "API Server"],
                    ["JWT + bcrypt", "Authentication"],
                    ["TypeScript 5.7", "Type Safety"],
                    ["Vitest", "Testing"],
                    ["npm Workspaces", "Monorepo"],
                    ["Nominatim", "Geocoding"],
                  ].map(([name, role]) => (
                    <div key={name} className="bg-[rgba(0,0,0,0.3)] rounded-lg px-4 py-3">
                      <div className="font-['Lixdu',sans-serif] text-[11px] uppercase tracking-[1.5px] text-white">{name}</div>
                      <div className="font-['Space_Grotesk',sans-serif] text-[10px] text-[rgba(255,255,255,0.4)] mt-0.5">{role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section id="data-model" title="Data Model">
              <TypeBlock name="Court" fields={`{
  id: string
  name: string
  address: string
  lat: number, lng: number
  type: "indoor" | "outdoor"
  surface: "hardwood" | "asphalt" | "rubber"
  amenities: string[]
  photos: string[]
  pricePerPlayerPerHour: number
  rating: number
  reviewCount: number
}`} />
              <TypeBlock name="Session" fields={`{
  id: string
  courtId: string
  createdBy: string
  date: string          // YYYY-MM-DD
  startTime: string     // HH:MM
  durationMinutes: number
  format: "5v5" | "3v3"
  mode: "open" | "private"
  maxPlayers: number
  players: string[]
  status: "filling" | "confirmed" | "cancelled" | "completed"
  autoConfirmDeadline: string
}`} />
              <TypeBlock name="Booking" fields={`{
  id: string
  sessionId: string
  userId: string
  amountPaid: number
  status: "confirmed" | "cancelled"
  createdAt: string
}`} />
              <TypeBlock name="Review" fields={`{
  id: string
  courtId: string
  userId: string
  rating: number        // 1-5
  comment: string
  createdAt: string
}`} />
            </Section>

            <Section id="project-structure" title="Project Structure">
              <div className={CARD}>
                <div className={CODE_BLOCK}>{`lateral-courts/
  client/                    React SPA (Vite)
    src/
      api/                   API client functions
      components/            Reusable UI components
      context/               Auth context (JWT + user state)
      hooks/                 TanStack Query hooks
      lib/                   Utilities (map, card validation)
      pages/                 Page components
      styles/                Global CSS, fonts, animations
  server/                    Fastify REST API
    src/
      data/                  Seed data (JSON files)
      middleware/             JWT verification
      repositories/          In-memory data access layer
      routes/                Route handlers
      services/              Business logic
  shared/                    TypeScript types
    types/                   Court, Session, Booking, etc.`}</div>
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="text-center pb-12 lg:hidden">
            <Link
              to="/"
              className="inline-block text-white rounded-xl px-8 py-4 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[2.5px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all no-underline"
              style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
            >
              Back to Courts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
