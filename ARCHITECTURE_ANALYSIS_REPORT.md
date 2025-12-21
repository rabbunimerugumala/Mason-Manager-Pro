# Manager Pro - Complete Architecture Analysis Report

## 1. High-Level Summary

**Manager Pro** is a modern, cloud-based construction site management web application designed for site managers and contractors. The application enables users to:

- **Track daily worker attendance** (workers and labourers) with intuitive counter interfaces
- **Manage multiple construction sites** with independent payment rates and configurations
- **Log miscellaneous expenses** (materials, equipment, etc.) with descriptions
- **Calculate real-time financial totals** for daily and weekly periods
- **Generate professional PDF reports** with weekly summaries and financial breakdowns
- **Export weekly summaries as JPG images** for easy sharing via messaging platforms
- **Maintain secure, isolated user accounts** with encrypted password storage

### Main Goal
To streamline construction site operations by providing a comprehensive, user-friendly platform for tracking attendance, managing costs, and generating financial reports—all with real-time cloud synchronization and multi-device support.

---

## 2. Tech Stack

### Core Framework & Language
- **Next.js 15.3.3** (App Router with Turbopack for fast development)
- **TypeScript 5** (Strict mode enabled)
- **React 18.3.1** (Client-side rendering with hooks)

### Backend & Database
- **Google Firebase** (Complete BaaS solution)
  - **Firestore** - NoSQL database for all application data
  - **Firebase Authentication** - Anonymous authentication for user sessions
  - **Firebase Security Rules** - Data access control

### Frontend UI & Styling
- **ShadCN UI** - Component library built on Radix UI primitives
- **Radix UI** - Accessible, unstyled component primitives
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **tailwindcss-animate** - Animation utilities
- **Lucide React** - Icon library

### Form Handling & Validation
- **React Hook Form 7.54.2** - Performant form state management
- **Zod 3.24.2** - TypeScript-first schema validation
- **@hookform/resolvers** - Integration between React Hook Form and Zod

### Data Processing & Utilities
- **date-fns 3.6.0** - Date manipulation and formatting
- **bcryptjs 2.4.3** - Password hashing (10 rounds)

### Export & Reporting
- **jsPDF 2.5.1** - PDF generation
- **jspdf-autotable 3.8.2** - Table generation in PDFs
- **html-to-image 1.11.11** - Convert HTML elements to JPG images

### Additional Libraries
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional class name utilities
- **@ducanh2912/next-pwa** - Progressive Web App support
- **vaul** - Drawer component library

---

## 3. File Structure Analysis

### Root Directory
```
Manager-Pro/
├── apphosting.yaml          # Firebase App Hosting configuration
├── components.json          # ShadCN UI component configuration
├── firebase.json            # Firebase project configuration
├── firestore.rules          # Firestore security rules
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── postcss.config.mjs       # PostCSS configuration for Tailwind
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── docs/                    # Project documentation
```

### Source Directory (`src/`)

#### `src/app/` - Next.js App Router Pages
**Responsibility**: Application routes and page components following Next.js App Router conventions.

- **`layout.tsx`** - Root layout with Firebase provider, Header, and global styles
- **`page.tsx`** - Authentication page (login/signup) - Entry point for unauthenticated users
- **`globals.css`** - Global CSS variables and Tailwind directives
- **`error.tsx`** & **`global-error.tsx`** - Error boundary components
- **`sites/page.tsx`** - Dashboard listing all work sites (protected route)
- **`places/[id]/page.tsx`** - Site detail page with daily record logging
- **`places/[id]/history/page.tsx`** - Weekly history view with PDF/JPG export
- **`places/[id]/loading.tsx`** - Loading state for dynamic routes
- **`places/[id]/error.tsx`** - Error state for dynamic routes
- **`settings/page.tsx`** - User account settings and data management

#### `src/components/` - Reusable UI Components
**Responsibility**: Modular, reusable React components organized by feature.

- **`layout/Header.tsx`** - Navigation header with user menu and logout
- **`places/`**
  - `PlaceCard.tsx` - Card component displaying site information
  - `PlaceForm.tsx` - Form for creating/editing work sites
- **`records/`**
  - `HistoryCard.tsx` - Mobile-friendly card view for daily records
  - `HistoryTable.tsx` - Desktop table view for daily records
  - `RecordForm.tsx` - Form component for daily record entry
- **`ui/`** - ShadCN UI component library (30+ components: buttons, dialogs, forms, etc.)
- **`FirebaseErrorListener.tsx`** - Global error handler for Firebase permission errors

#### `src/firebase/` - Firebase Integration Layer
**Responsibility**: Firebase initialization, context providers, and custom hooks for data access.

- **`config.ts`** - Firebase configuration object (API keys, project ID, etc.)
- **`index.ts`** - Main export file for Firebase utilities
- **`client-provider.tsx`** - Client-side Firebase initialization wrapper
- **`provider.tsx`** - React Context provider for Firebase services and auth state
- **`error-emitter.ts`** - Event emitter for Firebase errors
- **`errors.ts`** - Custom error classes (FirestorePermissionError)
- **`firestore/`**
  - `use-collection.tsx` - Custom hook for real-time Firestore collection subscriptions
  - `use-doc.tsx` - Custom hook for real-time Firestore document subscriptions

#### `src/lib/` - Core Business Logic & Utilities
**Responsibility**: Shared utilities, type definitions, and business logic.

- **`types.ts`** - TypeScript interfaces:
  - `UserProfile` - User account data
  - `Place` - Work site/construction site data
  - `DailyRecord` - Daily attendance and expense records
  - `AdditionalCost` - Individual expense items
- **`constants.ts`** - Application constants (routes, storage keys, app name)
- **`utils.ts`** - Utility functions (cn helper for class names, etc.)
- **`pdf-generator.ts`** - PDF report generation logic with weekly grouping

#### `src/hooks/` - Custom React Hooks
**Responsibility**: Reusable React hooks for common functionality.

- **`use-mobile.tsx`** - Hook to detect mobile devices
- **`use-toast.ts`** - Toast notification hook (from ShadCN UI)

#### `public/` - Static Assets
- **`hook.png`** - Application favicon/icon
- **`manifest.json`** - PWA manifest file

---

## 4. Key Files & Entry Points

### Application Entry Points

#### **Primary Entry: `src/app/layout.tsx`**
- **Role**: Root layout component that wraps the entire application
- **Key Responsibilities**:
  - Initializes `FirebaseClientProvider` (wraps all pages)
  - Renders global `Header` component
  - Provides `Toaster` for notifications
  - Sets up global CSS and metadata
- **Execution Flow**: Next.js automatically renders this as the root wrapper

#### **Authentication Entry: `src/app/page.tsx`**
- **Role**: Landing page and authentication handler
- **Key Responsibilities**:
  - Displays login/signup form
  - Handles user authentication (anonymous Firebase auth + custom user profile lookup)
  - Password hashing with bcryptjs
  - Redirects authenticated users to `/sites`
- **Execution Flow**: First page users see; redirects to `/sites` if already authenticated

#### **Main Application Entry: `src/app/sites/page.tsx`**
- **Role**: Dashboard showing all work sites
- **Key Responsibilities**:
  - Lists all user's work sites from Firestore
  - Provides "Create Site" functionality
  - Redirects unauthenticated users to home
- **Execution Flow**: Protected route; requires authentication

### Core Business Logic Files

#### **Firebase Initialization: `src/firebase/client-provider.tsx`**
- **Role**: Initializes Firebase services on client-side
- **Key Flow**:
  1. Calls `initializeFirebase()` from `config.ts`
  2. Gets Firebase App, Auth, and Firestore instances
  3. Wraps app in `FirebaseProvider` context

#### **Data Access Layer: `src/firebase/firestore/use-collection.tsx`**
- **Role**: Real-time Firestore collection subscription hook
- **Key Features**:
  - Uses `onSnapshot` for real-time updates
  - Handles loading and error states
  - Automatically adds document IDs to data
  - Emits permission errors via error emitter

#### **PDF Generation: `src/lib/pdf-generator.ts`**
- **Role**: Generates professional PDF reports
- **Key Features**:
  - Groups records by week (Monday-Saturday)
  - Calculates daily and weekly totals
  - Formats tables with jsPDF-autotable
  - Includes grand total and pagination

#### **Authentication Logic: `src/app/page.tsx` (handleLoginOrSignup function)**
- **Role**: Core authentication and user creation logic
- **Key Flow**:
  1. Signs in anonymously to Firebase Auth
  2. Queries Firestore for existing user by name
  3. If new: Creates user document with hashed password
  4. If existing: Verifies password with bcrypt.compare
  5. Stores user ID in sessionStorage
  6. Redirects to `/sites`

---

## 5. Data & Execution Flow

### Application Initialization Flow

```
1. Browser loads application
   ↓
2. Next.js renders src/app/layout.tsx
   ↓
3. FirebaseClientProvider initializes:
   - initializeFirebase() creates Firebase App instance
   - Gets Auth and Firestore services
   - Wraps app in FirebaseProvider context
   ↓
4. FirebaseProvider sets up:
   - onAuthStateChanged listener for auth state
   - Provides Firebase services via React Context
   ↓
5. Header component mounts and checks auth state
   ↓
6. Page component renders (based on route)
```

### Authentication Flow

```
User visits "/" (src/app/page.tsx)
   ↓
1. Component checks if user is already authenticated
   - If yes: Redirects to /sites
   - If no: Shows login/signup form
   ↓
2. User enters name and password, clicks "Login / Sign Up"
   ↓
3. handleLoginOrSignup() executes:
   a. Validates input (name and password required)
   b. Signs in anonymously to Firebase Auth (creates session)
   c. Queries Firestore: collection("users").where("name", "==", name)
   ↓
4. Branch Logic:
   
   NEW USER (query returns empty):
   - Hashes password with bcrypt.hash(password, 10)
   - Creates document: users/{authUser.uid}
   - Stores: { id, name, password (hashed), createdAt, updatedAt }
   - Sets sessionStorage: "manager-pro" = authUser.uid
   - Shows success toast
   - Redirects to /sites
   
   EXISTING USER (query returns document):
   - Retrieves stored hashed password from document
   - Compares: bcrypt.compare(password, storedHash)
   - If match:
     * Sets sessionStorage: "manager-pro" = document.id
     * Shows success toast
     * Redirects to /sites
   - If no match:
     * Shows error toast
     * Signs out anonymous session
```

### Data Access Flow (Real-Time Subscriptions)

```
Component needs data (e.g., src/app/sites/page.tsx)
   ↓
1. Component calls useUser() hook
   - Returns: { user, isUserLoading, userError }
   - user.uid is the authenticated Firebase user ID
   ↓
2. Component creates memoized Firestore reference:
   useMemo(() => 
     collection(firestore, 'users', user.uid, 'places'),
     [user, firestore]
   )
   ↓
3. Component calls useCollection<Place>(placesRef)
   ↓
4. useCollection hook:
   a. Sets up onSnapshot listener on Firestore collection
   b. Returns { data: null, isLoading: true, error: null }
   ↓
5. Firestore sends initial snapshot
   ↓
6. onSnapshot callback executes:
   - Maps documents: { ...doc.data(), id: doc.id }
   - Updates state: { data: Place[], isLoading: false, error: null }
   ↓
7. Component re-renders with data
   ↓
8. Any Firestore changes trigger new snapshot
   - onSnapshot callback fires again
   - Component automatically updates (real-time sync)
```

### Daily Record Creation Flow

```
User navigates to /places/[id] (src/app/places/[id]/page.tsx)
   ↓
1. Component loads:
   - useDoc<Place>(placeDocRef) - Gets site data
   - useCollection<DailyRecord>(todayRecordQuery) - Gets today's record (if exists)
   ↓
2. User selects date (default: today)
   - Component queries: dailyRecords where date == selectedDate
   ↓
3. If record exists:
   - Form pre-fills with existing data
   - todayRecordId is set
   ↓
4. User updates:
   - Worker count (increment/decrement buttons)
   - Labourer count
   - Additional costs (description + amount)
   ↓
5. User clicks "Save Record"
   ↓
6. handleSaveRecord() executes:
   a. Validates data
   b. Creates payload:
      {
        date: "YYYY-MM-DD",
        workers: number,
        labourers: number,
        additionalCosts: [{ description, amount }],
        updatedAt: serverTimestamp()
      }
   ↓
7. Branch Logic:
   
   UPDATE (todayRecordId exists):
   - updateDoc(doc(placeDocRef, 'dailyRecords', todayRecordId), payload)
   - Shows success toast
   
   CREATE (todayRecordId is null):
   - addDoc(collection(placeDocRef, 'dailyRecords'), 
            { ...payload, createdAt: serverTimestamp() })
   - Shows success toast
   ↓
8. Firestore updates
   ↓
9. Real-time listeners fire (onSnapshot)
   ↓
10. Component automatically updates with new data
```

### PDF Export Flow

```
User navigates to /places/[id]/history
   ↓
1. Component loads all records:
   - useCollection<DailyRecord>(recordsCollectionRef)
   ↓
2. Records are grouped by week:
   - parseISO(record.date) → getWeek() → weekKey: "2024-W15"
   - Groups records into weekly buckets
   - Calculates weekly totals
   ↓
3. User clicks "Export as PDF"
   ↓
4. generatePdf(place, records) executes:
   a. Creates new jsPDF document
   b. Adds header (site name, date, rates)
   c. Iterates through sorted weeks:
      - Creates table for each week
      - Headers: Date, Workers, Labourers, Other Costs, Daily Total
      - Body: One row per record with calculations
      - Footer row: Week Total
   d. Adds grand total at end
   e. Adds page numbers
   f. Triggers download: "History-Report-{siteName}-{date}.pdf"
```

### Request Handling (Next.js App Router)

```
HTTP Request → Next.js Server
   ↓
1. Next.js matches route:
   - / → src/app/page.tsx
   - /sites → src/app/sites/page.tsx
   - /places/[id] → src/app/places/[id]/page.tsx
   ↓
2. For each route:
   a. Server renders layout.tsx (if not already rendered)
   b. Server renders page component
   c. If "use client" directive: Component hydrates on client
   d. Client-side React takes over
   ↓
3. Client-side execution:
   - Firebase hooks initialize
   - Firestore listeners set up
   - Real-time data sync begins
   ↓
4. User interactions:
   - Form submissions → Firestore writes
   - Navigation → Next.js client-side routing
   - Data changes → Real-time UI updates via onSnapshot
```

### Security & Data Isolation

```
Firestore Security Rules (firestore.rules):
   ↓
1. All operations require authentication (isSignedIn())
   ↓
2. User documents (users/{userId}):
   - Any authenticated user can READ (needed for login lookup)
   - Only owner can WRITE
   ↓
3. User subcollections (users/{userId}/{document=**}):
   - Only owner can READ and WRITE
   - This includes: places, dailyRecords
   ↓
4. Result: Complete data isolation per user
   - User A cannot access User B's sites or records
   - All queries are scoped to user.uid
```

---

## Summary

Manager Pro is a well-architected, modern web application that leverages:
- **Next.js App Router** for file-based routing and server/client components
- **Firebase** for backend-as-a-service (authentication, database, real-time sync)
- **TypeScript** for type safety
- **Real-time data synchronization** via Firestore listeners
- **Secure, isolated multi-user architecture** with encrypted passwords
- **Professional reporting** with PDF and image export capabilities

The codebase follows React best practices with custom hooks, context providers, and modular component architecture. All data operations are real-time, providing instant synchronization across devices and browser sessions.

