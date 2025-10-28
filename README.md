# Mason Manager Pro

Mason Manager Pro is a modern, responsive web application built with Next.js, designed to help construction site managers or contractors easily track daily worker and labourer attendance, manage wages, and log miscellaneous expenses for multiple work sites. It features a clean, user-friendly interface that works seamlessly on both desktop and mobile devices.

## Features

-   **Multi-Site Management**: Create, edit, and delete multiple construction work sites, each with its own specific payment rates.
-   **Daily Attendance Tracking**: Easily log the number of workers and labourers present on any given day using a simple counter interface.
-   **Dynamic Cost Logging**: Add, edit, and delete an unlimited number of additional daily costs (e.g., "Cement bags," "Machine rental") with descriptions and amounts.
-   **Rate Customization**: Set and update the daily payment rates for workers and labourers on a per-site basis.
-   **Automated Payment Calculation**: The app automatically calculates total payments for the current day and the current week in real-time.
-   **Weekly Grouped History**: View a complete history of all records, neatly organized and grouped by week (from Monday to Saturday). Each week displays a sub-total for easy review.
-   **PDF Export**: Generate a professional, detailed PDF report of the entire history for a work site, including weekly totals and a grand total. This is perfect for record-keeping and sharing.
-   **Share as JPG**: Share a summary of any specific week's work as a downloadable JPG image, ideal for quick updates via messaging apps.
-   **Fully Mobile-Responsive**: The UI is optimized for all screen sizes, ensuring a seamless experience whether you are on a phone, tablet, or desktop.
-   **Persistent Local Storage**: All your data is automatically saved in the browser's local storage, so you never lose your records.
-   **Consistent & Modern UI**: The application uses a consistent design language with gradient buttons and a professional color palette, built with ShadCN UI and Tailwind CSS.

## Tech Stack

This project is built with a modern, robust, and scalable tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: React Context API with `useState`, `useEffect`, and `useCallback` hooks for clean and efficient state management across the app. Data is persisted in the browser's `localStorage`.
-   **Forms**: [React Hook Form](https://react-hook-form.com/) for performant and flexible form handling.
-   **Schema Validation**: [Zod](https://zod.dev/) for validating form data and ensuring type safety.
-   **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) and [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) for creating detailed, exportable PDF reports.
-   **Image Generation**: [html-to-image](https://github.com/bubkoo/html-to-image) for converting weekly report components into shareable JPG images.
-   **Date & Time**: [date-fns](https://date-fns.org/) for reliable and consistent date manipulation, crucial for grouping records by week.
-   **Icons**: [Lucide React](https://lucide.dev/) for a clean and consistent set of icons.

## Application Flow

The user journey is designed to be simple and intuitive:

1.  **Home Page**: The user lands on the home page, where they can see a list of all their existing work sites. From here, they can create a new site or choose an existing one to manage.
2.  **Create a Work Site**: By clicking "Create Site," the user can enter a name and set the daily rates for workers and labourers for that new site.
3.  **Site Dashboard**: After selecting a site, the user is taken to its dashboard. This is the main control center where they can:
    -   Log today's attendance for workers and labourers.
    -   Add any number of additional costs for the day.
    -   Update the payment rates for that specific site.
    -   See live calculations for "Today's Total Payment" and "This Week's Total."
4.  **View History**: From the dashboard, the user can navigate to the "History Log."
5.  **History Page**: This page displays all past records, grouped by week. The user can:
    -   Expand or collapse each week to see daily entries.
    -   Export the entire site history as a PDF.
    -   Share a specific week's summary as a JPG image.
    -   Edit or delete any individual past record.

## Project Structure & File Descriptions

The project follows a standard Next.js App Router structure.

```
.
├── src
│   ├── app
│   │   ├── places
│   │   │   ├── [id]
│   │   │   │   ├── history
│   │   │   │   │   └── page.tsx      # Displays weekly grouped history for a site
│   │   │   │   └── page.tsx          # Main dashboard for a specific work site
│   │   ├── globals.css           # Global styles, Tailwind CSS, and custom gradients
│   │   ├── layout.tsx            # Root layout for the application
│   │   └── page.tsx              # Home page displaying all work sites
│   ├── components
│   │   ├── layout
│   │   │   └── Header.tsx          # The header component for the app
│   │   ├── places
│   │   │   ├── PlaceCard.tsx       # Card component for a single work site on the home page
│   │   │   └── PlaceForm.tsx       # Form for creating and editing work sites
│   │   ├── records
│   │   │   ├── HistoryCard.tsx     # Card component for a single record (mobile view)
│   │   │   ├── HistoryTable.tsx    # Table for historical records (desktop view)
│   │   │   └── RecordForm.tsx      # Form for editing a specific daily record
│   │   └── ui                      # Reusable ShadCN UI components
│   ├── contexts
│   │   └── DataContext.tsx         # Global state management with React Context
│   ├── hooks
│   │   ├── use-mobile.tsx        # Custom hook to detect mobile devices
│   │   └── use-toast.ts          # Custom hook for displaying toast notifications
│   └── lib
│       ├── pdf-generator.ts      # Logic for generating PDF reports
│       ├── types.ts              # TypeScript type definitions for the application
│       └── utils.ts              # Utility functions (`cn` for classnames)
├── package.json                  # Project dependencies and scripts
└── tailwind.config.ts            # Tailwind CSS configuration
```

### `src/app/`

-   **`layout.tsx`**: The main application layout. It sets up the HTML structure, includes the global stylesheet, and wraps all pages with the `DataProvider` for state management.
-   **`page.tsx`**: The home page. It fetches the list of work sites from `DataContext` and displays them using the `PlaceCard` component. It also contains the dialog for creating a new site.
-   **`globals.css`**: Defines global styles, customizes the application's color theme using CSS variables, and includes the custom gradient button class (`btn-gradient-primary`).

### `src/app/places/[id]/`

-   **`page.tsx`**: The dashboard for a single work site. This is where users log daily attendance, add custom costs, and update payment rates. It features real-time payment calculations for the day and week.
-   **`history/page.tsx`**: The history page for a specific site. It groups records by week (Mon-Sat), calculates weekly totals, and provides options to export the entire history as a PDF or share a specific week's summary as a JPG. It responsively switches between `HistoryTable` (desktop) and `HistoryCard` (mobile).

### `src/components/`

-   **`layout/Header.tsx`**: The simple, consistent header displayed on all pages.
-   **`places/PlaceCard.tsx`**: A summary card for a work site on the home page. It shows the site name, rates, and provides buttons to manage, edit, or delete the site.
-   **`places/PlaceForm.tsx`**: A reusable form, powered by `react-hook-form` and `zod`, for both creating new work sites and editing existing ones.
-   **`records/HistoryTable.tsx`**: A table used on the history page for desktop screens. It neatly displays daily records with details on workers, labourers, other costs, and totals.
-   **`records/HistoryCard.tsx`**: A card-based view for a single daily record, used on the history page for mobile screens to ensure readability.
-   **`records/RecordForm.tsx`**: A form for editing the details of a past daily record, including workers, labourers, and the dynamic list of additional costs.

### `src/contexts/`

-   **`DataContext.tsx`**: The heart of the application's state management. It uses React Context and `useState`/`useEffect` hooks to manage all data.
    -   It initializes state from `localStorage` on load, ensuring data persistence. If no data is found, it loads initial mock data.
    -   It provides all the CRUD functions (`addPlace`, `updatePlace`, `addOrUpdateRecord`, etc.) that components use to modify data.
    -   Any change to the data triggers an automatic save back to `localStorage`.

### `src/lib/`

-   **`types.ts`**: Contains all TypeScript interfaces (`Place`, `DailyRecord`, `AdditionalCost`) that define the application's data structure.
-   **`pdf-generator.ts`**: Contains the logic to create a PDF report using `jspdf` and `jspdf-autotable`. It formats the data into weekly tables with proper headers and totals.
-   **`utils.ts`**: A utility file that includes the `cn` function for intelligently merging Tailwind CSS classes.

### `src/hooks/`

-   **`use-mobile.tsx`**: A simple custom hook that returns `true` if the viewport is below a certain width, allowing components to render different layouts for mobile.
-   **`use-toast.ts`**: A hook for dispatching toast notifications for user feedback (e.g., "Site created," "Record updated").
