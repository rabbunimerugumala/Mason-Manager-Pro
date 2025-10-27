# Mason Manager Pro

This is a Next.js application designed to help manage daily worker and labourer attendance, wages, and work sites. It provides a user-friendly interface to track daily records and calculate payments.

## Project Structure

The project is structured as a standard Next.js application using the App Router.

```
.
├── src
│   ├── app
│   │   ├── places
│   │   │   ├── [id]
│   │   │   │   ├── history
│   │   │   │   │   └── page.tsx      # Page to show record history for a specific site
│   │   │   │   └── page.tsx          # Dashboard page for a specific work site
│   │   ├── globals.css           # Global styles and Tailwind CSS configuration
│   │   ├── layout.tsx            # Root layout for the application
│   │   └── page.tsx              # Home page displaying all work sites
│   ├── components
│   │   ├── layout
│   │   │   └── Header.tsx          # The header component for the app
│   │   ├── places
│   │   │   ├── PlaceCard.tsx       # Card component to display a single work site
│   │   │   └── PlaceForm.tsx       # Form for creating and editing work sites
│   │   ├── records
│   │   │   ├── HistoryTable.tsx    # Table to display historical records
│   │   │   └── RecordForm.tsx      # Form for editing a daily record
│   │   └── ui                      # ShadCN UI components
│   ├── contexts
│   │   └── DataContext.tsx         # React Context for managing application state
│   ├── hooks
│   │   ├── use-mobile.tsx        # Hook to detect if the user is on a mobile device
│   │   └── use-toast.ts          # Hook for showing toast notifications
│   └── lib
│       ├── types.ts              # TypeScript type definitions for the application
│       └── utils.ts              # Utility functions, including `cn` for classnames
├── public                        # Static assets
└── tailwind.config.ts            # Tailwind CSS configuration
```

## File Descriptions

### `src/app/`

-   **`layout.tsx`**: The main layout of the application. It includes the HTML structure, adds the global stylesheet, and wraps the content in the `DataProvider`.
-   **`page.tsx`**: The homepage of the application. It displays a list of all created work sites using the `PlaceCard` component. It also includes functionality to create a new work site.
-   **`globals.css`**: Defines the global styles and customizes the color palette for the application using CSS variables for Tailwind CSS.

### `src/app/places/[id]/`

-   **`page.tsx`**: This is the main dashboard for a single work site. It allows users to:
    -   Log the number of workers and labourers for the current day.
    -   Update the payment rates for workers and labourers.
    -   View real-time payment calculations for the day and the week.
    -   Navigate to the full history page.
-   **`history/page.tsx`**: This page displays a complete history of attendance records for a specific work site in a tabular format using the `HistoryTable` component.

### `src/components/`

-   **`layout/Header.tsx`**: A simple header component that displays the application title and logo.
-   **`places/PlaceCard.tsx`**: A card component that provides a summary of a work site on the homepage, including rates and links to manage, edit, or delete the site.
-   **`places/PlaceForm.tsx`**: A reusable form for both creating new work sites and editing existing ones. It uses `react-hook-form` and `zod` for validation.
-   **`records/HistoryTable.tsx`**: Displays all historical records for a site. It allows for editing or deleting individual records.
-   **`records/RecordForm.tsx`**: A form for editing the details of a specific daily record (worker/labourer count and notes).

### `src/contexts/`

-   **`DataContext.tsx`**: This is the core of the application's state management. It uses React's Context API to manage all data related to work sites and their records.
    -   It initializes the data from `localStorage` if available, otherwise, it uses initial mock data.
    -   It provides functions to perform CRUD (Create, Read, Update, Delete) operations on places and their records.
    -   All data changes are persisted to `localStorage`.

### `src/lib/`

-   **`types.ts`**: Contains the TypeScript interfaces for the main data structures used in the app, such as `Place` and `DailyRecord`.
-   **`utils.ts`**: A utility file from ShadCN that includes the `cn` function to merge Tailwind CSS classes.

## How It Works

1.  **State Management**: The app uses `DataContext` to provide a centralized store for all application data. This context handles all interactions with `localStorage` to persist data across sessions.
2.  **Routing**: The app uses Next.js's App Router. The main page lists all sites. Clicking on a site takes you to `/places/[id]`, which is the dashboard for that site.
3.  **Data Flow**:
    -   Components use the `useData()` hook to access data and functions from `DataContext`.
    -   When a user performs an action (e.g., adding a record), the component calls a function from the context (e.g., `addOrUpdateRecord`).
    -   The context updates its state, which triggers a re-render of the affected components.
    -   The `useEffect` in `DataContext` saves the updated state to `localStorage`.
4.  **UI**: The UI is built using ShadCN components, which are highly customizable and accessible React components built on top of Radix UI and Tailwind CSS.
