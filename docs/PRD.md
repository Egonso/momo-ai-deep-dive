# Product Requirements Document: Momo AI Deep Dive Platform (v2.0)

**Version:** 2.0.0
**Status:** Approved for Development
**Owner:** Momo
**Tech Stack:** Next.js 14, Firebase, Gemini 1.5 Pro, Tailwind CSS
**Philosophy:** Code-First, In-Person Sanctity, Signal-to-Noise

---

## 1. Executive Summary & Vision

The **Momo AI Deep Dive Platform** is the single source of truth for the monthly high-performance AI gatherings. It is designed not as a generic event management tool, but as a bespoke "Digital Twin" of the physical experience.

**The Vision:**
A "Hybrid-Event-Hub" that rigorously distinguishes between the **High-Energy In-Person Experience** (The Penthouse) and the **High-Fidelity Passive Observation** (The Stream). The platform manages itself through time-based logic, reducing administrative overhead to near-zero ("Set & Forget").

**Core Principles:**
1.  **In-Person First:** The magic happens in the room. The online stream is a premium "fly-on-the-wall" service, not a replacement. Interaction priorities reflect this.
2.  **Code-as-Content:** Critical event data (dates, themes, descriptions) lives in `src/data/events.ts`. This ensures version control, zero latency, and "Engineering Magic" deployments.
3.  **Signal-to-Noise:** The UI is radically simple. No banners, no popups. Only the next relevant action (RSVP, Watch, or Learn).
4.  **Automated Operations:** The platform state (Teaser → RSVP → Live → Archive) is determined deterministically by `Date.now()`, not by manual toggles.

---

## 2. User Roles & Journeys

### 2.1 The Penthouse Guest (VIP)
*   **Profile:** Locals, Builders, High-Energy Networkers.
*   **Goal:** Secure one of the limited spots (e.g., 20 pax).
*   **Mechanism:** First-come-first-serve, filtered by "In-Person" selection.
*   **Privileges:** Physical access, F&B, Direct Q&A.

### 2.2 The Global Observer (Online)
*   **Profile:** International or remote community members.
*   **Goal:** Consume the content live without friction.
*   **Mechanism:** Unlimited capacity, specific "Stream Mode" UI.
*   **Privileges:** 1080p Stream, Chat (Secondary Priority), downloadable assets.

### 2.3 The Time-Traveler (Post-Event)
*   **Profile:** Anyone accessing the platform after the event concludes.
*   **Goal:** Learn specific skills or review concepts.
*   **Mechanism:** "Recording Mode" + RAG Chat.
*   **Interaction:** Asking the "AI Brain" specific questions about the session content.

### 2.4 The Operator (Momo)
*   **Goal:** Update content with minimal cognitive load.
*   **Mechanism:**
    *   **Git:** "New Event" = Copy/Paste JSON block in `events.ts`.
    *   **Admin Tools:** Minimal scripts for RAG ingestion & Email blasts.

---

## 3. Functional Specifications

### 3.1 Authentication & Identity
*   **Provider:** Firebase Auth.
*   **Methods:**
    *   **Google Sign-In:** Frictionless for most devs.
    *   **Magic Link (Email):** For password-haters.
*   **Session:** Persistent.
*   **Protection:**
    *   RSVP requires Auth.
    *   Live Stream requires Auth (to prevent public leaching and gather leads).
    *   RAG Chat requires Auth (rate limiting).

### 3.2 The Event State Machine (RSVP Logic)
The RSVP system is the central interactive component.

**States:**
1.  **Open:** `NOW < EventStart` AND `Count(InPerson) < Limit`. -> Button: "Reserve Spot".
2.  **Waitlist:** `NOW < EventStart` AND `Count(InPerson) >= Limit`. -> Button: "Join Waitlist".
3.  **Closed/Live:** `NOW >= EventStart`. -> Button: "Watch Stream".

**The Intelligent Storno Flow:**
1.  User clicks "Cancel Ticket".
2.  **System Intercept:** "Can't make it to the Penthouse? Do you want to switch to the **Online Stream** instead?"
    *   **YES:** Updates RSVP type to 'online', frees up 'in-person' slot.
    *   **NO:** Deletes RSVP entirely.
3.  **Auto-Promotion:** If a slot opens, the system (via scheduled function or next trigger) notifies the top waitlisted user (or auto-promotes if aggressive). *MVP: Email notification to Admin/Waitlist.*

### 3.3 Time-Travel & Content Reveal Logic
The UI adapts based on the `revealAt` property of the `Active Event`.

**Algorithm `getCurrentActiveEvent()`:**
1.  Filter: `events.filter(e => e.revealAt <= Now)`
2.  Sort: `date` Descending.
3.  Head: The first item is the "Active" context.

**Display Modes:**
*   **Teaser Mode:** `Now < revealAt` (Technically invisible, but if manual override).
*   **Hype Mode:** `revealAt <= Now < EventStart`. (Countdown, RSVP, Agenda).
*   **Live Mode:** `EventStart <= Now <= EventEnd + Buffer`. (Stream Player, Chat).
*   **Archive Mode:** `Now > EventEnd`. (YouTube Replay, "Ask AI", Recap).

### 3.4 The "Second Brain" (RAG + Gemini)
*   **Ingestion:** Admin script uploads session transcripts (TXT/PDF) to Gemini File API.
*   **Indexing:** Gemini handles context caching/embeddings.
*   **Retrieval:**
    *   User asks: "How do I build the invoice agent?"
    *   Backend: `model.generateContent([prompt, file_reference])`.
    *   Response: "In the February session, Momo explained... [Timestamp 45:20]".

---

## 4. Technical Architecture

### 4.1 Tech Stack
*   **Framework:** Next.js 14+ (App Router).
*   **Styling:** Tailwind CSS (with `typography` plugin for markdown).
*   **Icons:** Lucide React.
*   **Animations:** Framer Motion (page transitions, micro-interactions).
*   **Database (State):** Firebase Firestore.
*   **Database (Content):** Git (`src/data/events.ts`).
*   **AI/LLM:** Google Gemini 1.5 Pro (via Vercel AI SDK).
*   **Hosting:** Vercel.

### 4.2 Data Models

**A. Code Config (`src/data/events.ts`)**
```typescript
interface EventId = string; // format: "YYYY-MM-slug"

interface EventConfig {
  id: EventId;
  title: string;
  description: string;
  theme: 'emerald' | 'amber' | 'rose' | 'sky'; // UI Theme
  date: string; // ISO 8601
  revealAt: string; // ISO 8601 - Visibility Trigger
  durationHours: number;
  youtubeId?: {
    live?: string; // Unlisted Stream ID
    replay?: string; // Edited Recording ID
  };
  assets: {
    label: string;
    type: 'pdf' | 'link' | 'code';
    url: string;
  }[];
}
```

**B. Firestore Schema**
*   **Collection `users`:**
    *   `uid` (Key)
    *   `email`: string
    *   `name`: string
    *   `avatar`: string
    *   `role`: 'user' | 'admin'
    *   `createdAt`: Timestamp

*   **Collection `rsvps`:**
    *   `compositeKey`: `${eventId}_${uid}`
    *   `eventId`: string
    *   `uid`: string
    *   `type`: 'in-person' | 'online'
    *   `status`: 'confirmed' | 'waitlist' | 'cancelled'
    *   `timestamp`: Timestamp

### 4.3 API Routes
*   `POST /api/auth/session`: Manage Firebase Auth cookies (if needed for middleware).
*   `POST /api/chat`: Endpoint for RAG.
    *   Input: `{ message, eventId }`
    *   Process: Retrieve relevant transcripts for `eventId` -> Call Gemini.
*   `GET /api/calendar/:eventId`: Generates .ics file dynamically.

---

## 5. UI/UX Design System

### 5.1 Aesthetic "The Signal"
*   **Dark Mode Default:** Sleek, hacker-friendly, cinema-feel.
*   **Theme Engine:** Each event defines a primary color. The entire UI (Buttons, Accents, Glows) adapts to this `theme` prop.
    *   *Efficiency:* "Emerald" vs *Creativity:* "Amber".
*   **Typography:** Sans-serif (Inter or Geist Sans). Clean, high readability.

### 5.2 Key Interactions
*   **The RSVP Switch:** A segmented control or specialized toggle that physically separates "Penthouse" (Left) and "Stream" (Right).
    *   *Penthouse Side:* Shows counter "4 Seats Left".
    *   *Stream Side:* Shows "Always Open".
*   **The Time-Travel Slider:** A timeline component in the Archive view to scrub through past months.

---

## 6. Implementation Roadmap

### Phase 1: The Core (Skeleton)
*   [ ] Initialize Next.js project.
*   [ ] Configure Tailwind & Theme System.
*   [ ] Implement `events.ts` and `TimeTravel` logic.
*   [ ] Build Landing Page (Hero) that renders the "Active Event".

### Phase 2: Identity & RSVP
*   [ ] Integrate Firebase Auth.
*   [ ] Build RSVP Form with Firestore connection.
*   [ ] Implement Capacity Checking & Waitlist UI (Frontend only first).

### Phase 3: The Brain (AI)
*   [ ] Setup Vercel AI SDK + Gemini.
*   [ ] Build RAG Pipeline (Upload Script + Chat UI).
*   [ ] Connect Chat UI to Event Detail page.

### Phase 4: Polish & Launch
*   [ ] Add Email/Calendar integrations.
*   [ ] "Deep Dive" Testing of Storno flows.
*   [ ] Final Design Polish (Animations).
*   [ ] Deployment.

---

**Approved by:** Momo
**Date:** 2026-01-23
