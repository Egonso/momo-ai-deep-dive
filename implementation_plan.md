# Implementation Plan - Momo AI Deep Dive UI

**Goal:** Build the complete, high-fidelity UI for the Momo AI Deep Dive Platform (v2.0) based on the "Digital Twin" & "Hacker-chic" vision.

## User Review Required
> [!IMPORTANT]
> This plan focuses heavily on the **Visuals and Frontend Logic** first, as requested ("EVERY part of the UI perfectly"). Backend connections (Firebase/Gemini) will be mocked initially to ensure the UI feels perfect and responsive.

## Proposed Changes

### 1. Foundation & Assets
#### [NEW] [utils.ts](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/lib/utils.ts)
- `cn` utility for Tailwind class merging.
- Time-travel Logic helpers (`getCurrentActiveEvent`, `getEventStatus`).

#### [NEW] [events.ts](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/data/events.ts)
- The Single Source of Truth.
- Populated with 3 mock events (Past, Present/Next, Future) to test all UI states.

#### [MODIFY] [globals.css](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/app/globals.css)
- Implement the "Signal-to-Noise" Dark Theme.
- CSS Variables for dynamic theming (`--theme-primary`, `--theme-glow`).

### 2. UI Components (The "Signal")
#### [NEW] [components/ui](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/components/ui)
- `Button.tsx`: High-energy variants (Penthouse vs Stream).
- `Badge.tsx`: Status indicators (Live, Waitlist, Recorded).
- `Card.tsx`: Glassmorphic containers for the dashboard.
- `RsvpToggle.tsx`: The custom segmented control for In-Person vs Online.

### 3. Page Implementations
#### [MODIFY] [page.tsx](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/app/page.tsx)
- **Hero Section:** Dynamic "Time Travel" Hero.
- **State Handling:** Renders `Teaser`, `Hype` (RSVP), `Live` (Stream), or `Archive` view based on `events.ts`.

#### [NEW] [components/rsvp/RsvpFlow.tsx](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/components/rsvp/RsvpFlow.tsx)
- The core interaction loop: Auth Check -> Type Selection -> Confirmation.

#### [NEW] [components/dashboard/TicketWallet.tsx](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/components/dashboard/TicketWallet.tsx)
- Visual representation of the user's spot (QR code style).

4. Integrations
#### [MODIFY] [components/dashboard/TicketWallet.tsx](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/components/dashboard/TicketWallet.tsx)
-   **Google Calendar**: Construct `https://calendar.google.com/calendar/render` URL with event details.
-   **ICS Download**: Generate a valid VCALENDAR blob on the fly and trigger download.
-   **Web Share**: Use `navigator.share` API for mobile-native sharing, fallback to `navigator.clipboard.writeText` for desktop.
-   **Real QR Code**: Integrate `react-qr-code` to generate scanable codes containing ticket ID/User ID.

### 5. Group Registration & Downloads
#### [MODIFY] [src/components/rsvp/RsvpFlow.tsx](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/components/rsvp/RsvpFlow.tsx)
-   **Multi-Step Form**: Add "Add Attendee" logic.
-   **Data Fields**: Mandatory Name, Email, WhatsApp for EACH attendee.
-   **Privacy Hint**: GDPR notice before submission.

#### [MODIFY] [src/components/dashboard/TicketWallet.tsx](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/components/dashboard/TicketWallet.tsx)
-   **Visual Ticket**: Render a clean, printable HTML/Canvas ticket.
-   **Download Action**: `html-to-image` integration to save Ticket as PNG/PDF.

## Verification Plan

### Automated Tests
- None for this UI-focused sprint.

4.  **Registration Flow:** Register 2 people with different names/emails and verify Firestore structure.

### 6. Archive, Stream & Chat (The "Deep Dive" Features)
#### [NEW] [src/app/archive/page.tsx](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/app/archive/page.tsx)
- Grid view of all PAST events.
- Download buttons for Assets (PDFs, Code).
- YouTube Replay Embeds.

#### [MODIFY] [src/app/page.tsx](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/app/page.tsx)
- **Live Mode**: Replace "Join Stream" button with an actual YouTube Embed + Chat overlay when clicked.

#### [NEW] [src/components/chat/AskMomo.tsx](file:///Users/momofeichtinger/Projects/Programmieren/momo-ai-deep-dive/src/components/chat/AskMomo.tsx)
- Floating Action Button (bottom right).
- Opens a chat window to query the "Knowledge Base".
- *Initial MVP*: Mocks response or simple keyword search if backend isn't ready.
