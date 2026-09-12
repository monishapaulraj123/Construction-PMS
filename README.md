# Construction PMS

A complete React + Vite front-end for a construction project management SaaS
dashboard, built with local mock data so it can be wired up to a real API
later without changing component contracts.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

To create a production build:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/   Reusable UI building blocks (Sidebar, Header, DataTable, Modal, etc.)
  pages/        One file per route/screen
  data/         Local mock data + route -> page-title mapping
  styles/       Design tokens and modular CSS (tokens, base, layout, components, pages)
  utils/        Formatting helpers (currency, dates, status colors)
```

## Roles reflected in the UI

The UI uses only generic role labels: Admin / Administrator, Client,
Supervisor and Supplier. No personal names appear anywhere in the interface.

## Notes for backend integration

- All data currently lives in `src/data/mockData.js`, shaped to mirror the
  intended database tables (employee_type, item_category, item, supplier,
  employee, service, construction_type, construction_stage, project, client).
- Master-data screens (Employee Types, Employees, Suppliers, Services,
  Clients) are powered by a single reusable `MasterDataPage` component driven
  by column/field configuration, so adding a new master table mostly means
  adding a config object rather than a new screen from scratch.
- Swap the mock arrays for API calls (e.g. inside `useEffect` + `fetch`) and
  the existing components will keep working as-is.
