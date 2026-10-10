# WageEasy

**Simple, Hindi-first attendance and payroll for small Indian factories.**

WageEasy is a web-based factory attendance and payroll management system that replaces paper registers and manual salary calculation. It is built to be easy enough for low-literacy workers to use, runs entirely in the browser, and needs no app installation.

> **Status:** MVP in active development. The core loop (QR attendance → employer dashboard → payroll) is working or being finalised; some features are intentionally deferred (see [Roadmap](#roadmap)).

---

## Why WageEasy?

Many small factories in India still track attendance and wages by hand. Existing tools such as SalaryBox and StaffApp are feature-rich, but that richness can be a barrier for owners and workers who are not comfortable with complex software.

WageEasy competes on **accessibility rather than feature breadth**:

- **Simplicity**: only the essentials, with a clean, minimal interface
- **Hindi-first**: Hindi and English are both first-class, with a language switcher
- **Low-literacy friendly**: QR-based check-in/out minimises typing and reading
- **No install**: one responsive website that works on mobile and desktop

---

## Features

### Worker side
- QR-code-based check-in and check-out
- Attendance history

### Employer side
- Dashboard with live attendance data
- Employee approval flow (with auto-redirect after approval)
- Payroll calculation
- Attendance history

### General
- Hindi / English language switcher built on an extensible i18n architecture
- Email-based authentication
- Responsive layout for phone and desktop
- Logout functionality

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) with TypeScript |
| Styling | Tailwind CSS |
| Backend / Database | Supabase (Postgres, Auth, Storage) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended) and npm
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/Manasjain84/WageEasy.git
cd WageEasy
npm install
```

### Environment variables

Create a `.env.local` file in the project root and add your Supabase credentials (variable names below are the standard ones for Next.js + Supabase; match them to what your code uses):

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Make sure these are real values, not placeholders. Also confirm your Supabase auth settings (including email/SMTP) and database schema match what the app expects.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Roadmap

Deliberately deferred to keep the MVP scope tight:

- [ ] OTP / SMTP polish and production-grade email reliability
- [ ] Support for workers without smartphones
- [ ] Selfie-based verification to prevent attendance fraud
- [ ] Further QA to remove remaining hardcoded placeholder data on some pages

---

## Contributing

This is a student project and feedback is welcome. Feel free to open an issue or submit a pull request.

---

## Author

**Manas**, MCA student at Manipal University Jaipur
GitHub: [@Manasjain84](https://github.com/Manasjain84)
