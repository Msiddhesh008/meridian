# Meridian

Minimal PWA for team leads — daily attendance, focus timers, work hours, and member-to-project allocation.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Zustand (UI state)
- Dexie / IndexedDB (local database for all data)
- vite-plugin-pwa

## Run

```bash
npm install
npm run dev
```

## Features

- Clock in / out / break
- Start–stop work sessions with live duration
- Daily & weekly hour totals
- 12-member team roster with capacity bars
- Assign members to projects (hours/week)
- Overload warnings & weekly report + CSV export
- Installable PWA with offline shell
- All data stored in IndexedDB (`meridian_local`)
# meridian
