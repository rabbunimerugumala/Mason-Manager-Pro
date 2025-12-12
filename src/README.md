# Manager Pro

Mason Manager Pro is a modern, responsive web application built with Next.js, designed to help construction site managers or contractors easily track daily worker attendance, manage wages, and log miscellaneous expenses. It supports multiple user accounts on the same device, with data for each user stored securely and separately in the browser's local storage.

## Features

-   **Multi-User Accounts**: Create multiple user accounts, each with a unique username and password. All data is sandboxed per user, ensuring privacy and separation of work sites.
-   **Local-First Authentication**: A secure and fast login/signup system that stores user credentials locally on the device.
-   **Multi-Site Management**: Create, edit, and delete multiple construction work sites, each with its own specific payment rates.
-   **Daily Attendance Tracking**: Easily log the number of workers and labourers present on any given day using a simple counter interface.
-   **Dynamic Cost Logging**: Add, edit, and delete an unlimited number of additional daily costs (e.g., "Cement bags," "Machine rental") with descriptions and amounts.
-   **Rate Customization**: Set and update the daily payment rates for workers and labourers on a per-site basis.
-   **Automated Payment Calculation**: The app automatically calculates total payments for the current day and the current week in real-time.
-   **Weekly Grouped History**: View a complete history of all records, neatly organized and grouped by week (from Monday to Saturday). Each week displays a sub-total for easy review.
-   **PDF Export**: Generate a professional, detailed PDF report of the entire history for a work site, including weekly totals and a grand total.
-   **Share as JPG**: Share a summary of any specific week's work as a downloadable JPG image, ideal for quick updates via messaging apps.
-   **Fully Mobile-Responsive**: The UI is optimized for all screen sizes. Dialogs adapt into drawers on mobile for a seamless experience.
-   **Persistent & Private Local Storage**: All your data is automatically saved in the browser's `localStorage` and is tied to your user account on the specific device you are using.
-   **Modern UI**: Built with ShadCN UI and Tailwind CSS for a consistent and professional design.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/) (including responsive Dialogs/Drawers)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: React Context API (`UserContext` & `DataContext`) with `localStorage` for persistence.
-   **Forms**: [React Hook Form](https://react-hook-form.com/)
-   **Schema Validation**: [Zod](https://zod.dev/)
-   **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
-   **Image Generation**: [html-to-image](https://github.com/bubkoo/html-to-image)
-   **Date & Time**: [date-fns](https://date-fns.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## Application Flow

1.  **Authentication**: The user is first greeted with a login/signup page. They can create a new account or log in with existing credentials.
2.  **Home Page (Work Sites)**: After logging in, the user lands on the home page, where they can see a list of all their existing work sites. From here, they can create a new site or choose an existing one to manage.
3.  **Site Dashboard**: Selecting a site takes the user to its dashboard. This is the main control center for logging daily attendance, adding costs, and updating payment rates.
4.  **History Log**: From the dashboard, the user can navigate to the "History Log" to view all past records for that site. The history is grouped by week and includes options to export to PDF or share a week as a JPG.
5.  **Settings**: The user can access the settings page from the profile dropdown in the header. Here, they have the option to clear all data associated with their account.
6.  **Sign Out**: The user can sign out from the profile dropdown, which will return them to the login screen.

## Data Storage

All data is stored locally in the browser's `localStorage` on the device you are using. This makes the app fast and functional even when offline. Data is sandboxed per user.

-   **User Accounts**: A list of all users is stored under the key `mason-manager-users`.
-   **Current User Session**: The currently logged-in user's information is stored under `mason-manager-current-user`.
-   **Site & Record Data**: All work sites and daily records are stored under a key unique to the logged-in user, like `mason-manager-pro-data-username`. This ensures that each user's data is kept separate and private on that device.

## Project Structure & File Descriptions

```
.
├── src
│   ├── app
│   │   ├── places
│   │   │   ├── [id]
│   │   │   │   ├── history
│   │   │   │   │   └── page.tsx      # Displays weekly grouped history for a site
│   │   │   │   └── page.tsx          # Main dashboard for a specific work site
│   │   ├── settings
│   │   │   └── page.tsx              # Settings page for the current user
│   │   ├── sites
│   │   │   └── page.tsx              # Home page displaying user's work sites
│   │   ├── globals.css           # Global styles and Tailwind CSS theme
│   │   ├── layout.tsx            # Root layout with providers
│   │   └── page.tsx              # Login/Signup page
│   ├── components
│   │   ├── layout/Header.tsx       # App header with user profile dropdown
│   │   ├── places/PlaceCard.tsx    # Card for a single work site
│   │   ├── places/PlaceForm.tsx    # Form for creating/editing sites
│   │   └── records/              # Components for history and record management
│   ├── contexts
│   │   ├── DataContext.tsx         # State management for sites and records (per user)
│   │   └── UserContext.tsx         # State management for user accounts and auth
│   ├── hooks/
│   ├── lib/
│   └── ...
└── ...
```
