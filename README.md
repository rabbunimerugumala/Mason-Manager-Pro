# Manager Pro

A modern construction site management application for tracking worker attendance, daily expenses, and generating comprehensive reports. Built with Next.js 15 and Firebase, Manager Pro provides a secure, user-friendly interface for managing multiple construction sites efficiently.

## Project Overview

**Manager Pro** is a web application designed for construction site managers and contractors to streamline daily operations. It enables users to track worker and laborer attendance, log miscellaneous expenses, set payment rates, and generate professional PDF and image reports—all with real-time data synchronization and complete data privacy.

### Key Features

- **Multi-Site Management**: Create and manage multiple construction sites with independent payment rates
- **Daily Worker/Laborer Tracking**: Log daily attendance using intuitive counter interfaces
- **Expense Logging**: Add unlimited additional costs (materials, equipment, etc.) with descriptions
- **Real-Time Calculations**: Automatic computation of daily and weekly payment totals
- **PDF Reports**: Generate professional weekly reports with financial summaries
- **Image Sharing**: Export weekly summaries as JPG images for easy sharing
- **Offline Support/PWA**: Progressive Web App capabilities for offline access
- **User-Specific Data**: Complete data isolation—each user's data is private and secure
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 15.3.3 (App Router with Turbopack)
- **Language**: TypeScript
- **Database**: Firebase Firestore (real-time NoSQL database)
- **Authentication**: Custom username/password system with bcryptjs hashing
- **UI Framework**: ShadCN UI + Radix UI Components
- **Styling**: Tailwind CSS with custom animations
- **Form Handling**: React Hook Form with Zod validation
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Image Processing**: html-to-image
- **Date Utilities**: date-fns
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm (or yarn/pnpm)
- **Firebase Account**: A Firebase project with Firestore enabled
- **Git** (optional, for cloning)

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Manager-Pro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory with your Firebase configuration keys.

   **Where to Get Firebase Keys:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (or create a new one)
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - If you don't have a web app, click "Add app" and select the web icon (</>)
   - Copy the configuration values

   **`.env.local` Template:**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   > **Important**: Replace all placeholder values with your actual Firebase configuration keys.

4. **Configure Firestore Security Rules**

   After creating your Firestore database:
   - Go to Firebase Console → Firestore Database → Rules tab
   - Replace the default rules with the rules from `firestore.rules` in this repository
   - Click "Publish" to save

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:9002`

## Project Structure

```
Manager-Pro/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Login/Signup page
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── sites/              # Work sites dashboard
│   │   │   └── page.tsx
│   │   ├── places/             # Site management
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Site detail & daily logging
│   │   │       └── history/
│   │   │           └── page.tsx # Weekly history & reports
│   │   └── settings/           # User settings
│   │       └── page.tsx
│   ├── components/             # React components
│   │   ├── layout/             # Layout components (Header, etc.)
│   │   ├── places/             # Site management components
│   │   ├── records/            # Record & history components
│   │   └── ui/                 # ShadCN UI components
│   ├── context/                # React Context providers
│   │   ├── AuthContext.tsx     # Authentication context
│   │   └── FirebaseProvider.tsx # Firebase services context
│   ├── firebase/               # Firebase configuration
│   │   ├── config.ts           # Firebase initialization
│   │   └── index.ts            # Firebase utilities
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-firestore.ts    # Firestore data hooks
│   │   └── use-mobile.tsx      # Mobile detection hook
│   └── lib/                    # Utilities and types
│       ├── types.ts            # TypeScript interfaces
│       ├── constants.ts        # App constants
│       ├── utils.ts            # Helper functions
│       └── pdf-generator.ts    # PDF export logic
├── public/                     # Static assets
├── firestore.rules             # Firestore security rules
├── .env.local                  # Environment variables (not in git)
└── package.json                # Dependencies and scripts
```

### Key Directories Explained

- **`src/app/`**: Next.js App Router pages. Each folder represents a route.
- **`src/components/`**: Reusable React components organized by feature.
- **`src/context/`**: React Context providers for global state (Auth, Firebase).
- **`src/firebase/`**: Firebase configuration and initialization.
- **`src/hooks/`**: Custom React hooks for data fetching and utilities.
- **`src/lib/`**: Shared utilities, types, and helper functions.

## User Guide

### Authentication

Manager Pro uses a simple **Username/Password** login system:

1. **First Time Users (Sign Up)**:
   - Enter your name and password on the login page
   - If the username doesn't exist, a new account will be created automatically
   - You'll be logged in and redirected to the sites dashboard

2. **Returning Users (Login)**:
   - Enter your existing username and password
   - Click "Login / Sign Up" to access your dashboard

3. **Session Management**:
   - Your login session persists across browser sessions
   - Log out using the dropdown menu in the header

### Managing Sites

1. **Create a New Work Site**:
   - From the sites dashboard, click "Create Site"
   - Enter the site name (e.g., "Downtown Skyscraper")
   - Optionally set daily payment rates for workers and laborers
   - Click "Create Site" to save

2. **Edit Site Details**:
   - Click the edit icon (pencil) on any site card
   - Update the name or payment rates
   - Save changes

3. **Delete a Site**:
   - Click the delete icon (trash) on a site card
   - Confirm deletion (this will also delete all associated records)

### Daily Workflow

1. **Open a Site**:
   - Click "Manage Site" on any site card from the dashboard
   - You'll see the site detail page with today's date selected

2. **Log Daily Attendance**:
   - Use the +/- buttons to set worker and laborer counts
   - The counts update in real-time

3. **Add Additional Costs**:
   - Scroll to "Additional Costs" section
   - Click "Add Cost" to add expense items
   - Enter description (e.g., "Cement bags") and amount
   - Remove costs using the trash icon

4. **Save the Record**:
   - Click "Save Record" to save today's log
   - The record is saved and can be updated later
   - Daily and weekly totals are calculated automatically

5. **Change Date**:
   - Click "Change Date" to log records for past or future dates
   - Select a date from the calendar
   - View or edit records for that date

6. **Update Payment Rates**:
   - Scroll to "Payment Rates" section
   - Update worker and laborer daily rates
   - Click "Save Rates" to apply changes

### Reports

1. **View History**:
   - From a site's detail page, click "View Full History"
   - Records are grouped by week (Monday-Saturday)
   - Each week shows total records and week total

2. **Export as PDF**:
   - From the history page, click "Export as PDF"
   - A comprehensive PDF report will be generated and downloaded
   - Includes weekly summaries, daily breakdowns, and grand totals

3. **Share as Image**:
   - Expand any week in the history view
   - Click "Share Week as JPG" at the bottom
   - A JPG image of that week's summary will be downloaded
   - Perfect for sharing via messaging apps

## Data Architecture

Manager Pro uses Firebase Firestore with a user-centric data structure to ensure complete data privacy:

```
users/
└── {userId}/                    # Each user has their own private folder
    ├── id: string
    ├── name: string
    ├── password: string (hashed with bcryptjs)
    ├── createdAt: timestamp
    └── sites/                    # Subcollection: User's work sites
        └── {siteId}/
            ├── id: string
            ├── name: string
            ├── workerRate: number
            ├── labourerRate: number
            ├── createdAt: timestamp
            └── dailyRecords/     # Subcollection: Daily attendance records
                └── {recordId}/
                    ├── id: string
                    ├── date: string (YYYY-MM-DD)
                    ├── workers: number
                    ├── labourers: number
                    ├── additionalCosts: array
                    ├── createdAt: timestamp
                    └── updatedAt: timestamp
```

**Key Points:**
- Each user's data is completely isolated under `users/{userId}/`
- Sites are stored as subcollections under each user
- Daily records are subcollections under each site
- All data is private to the user who created it
- Real-time synchronization across all devices

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack (port 9002) |
| `npm run build` | Build optimized production bundle |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run typecheck` | Verify TypeScript type safety |

## Security Considerations

- **Password Security**: Passwords are hashed using bcryptjs (10 rounds) before storage
- **Firestore Security Rules**: Configure rules to allow read/write access for the custom auth system
- **Environment Variables**: Never commit `.env.local` to version control
- **HTTPS Only**: Always deploy to HTTPS-enabled platforms
- **Data Privacy**: Each user's data is isolated and cannot be accessed by other users

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in Vercel's dashboard
4. Deploy with one click

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy --only hosting`

## Troubleshooting

### Common Issues

**Issue**: "Module not found: Can't resolve 'firebase/app'"
- **Solution**: Run `npm install` to ensure Firebase package is installed

**Issue**: "Permission denied" errors in Firestore
- **Solution**: Update Firestore security rules in Firebase Console to match `firestore.rules`

**Issue**: Loading spinner never stops
- **Solution**: 
  1. Check that Firestore database is created in Firebase Console
  2. Verify Firestore security rules are published
  3. Check browser console for error messages

**Issue**: Environment variables not loading
- **Solution**: 
  1. Ensure `.env.local` file exists in root directory
  2. Restart the development server after adding environment variables
  3. Verify all `NEXT_PUBLIC_*` variables are prefixed correctly

**Issue**: Build fails with TypeScript errors
- **Solution**: Run `npm run typecheck` to identify issues and fix them

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, issues, or questions:
- Create an issue in the GitHub repository
- Check the documentation in the codebase

---

**Manager Pro** — Empowering construction professionals with intelligent project management.

*Built with ❤️ using Next.js, Firebase, and TypeScript*

