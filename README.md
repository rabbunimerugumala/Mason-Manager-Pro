# Manager Pro

Manager Pro is a modern, responsive web application designed for construction site managers and contractors to efficiently manage daily operations. Built with cutting-edge technologies, it enables users to track worker attendance, manage labor costs, log miscellaneous expenses, and generate professional reports—all with a secure, user-friendly interface.

## Overview

Manager Pro supports multi-user accounts with role-based data isolation, cloud-based storage via Firestore, and comprehensive tools for financial tracking and reporting. Whether managing a single site or multiple construction projects, Manager Pro streamlines operations and provides real-time financial insights.

## Key Features

- **Multi-User Accounts with Secure Authentication**: Create multiple user accounts with encrypted password security using bcryptjs. Each user's data is completely isolated and private.
- **Cloud-Based Data Storage**: All data is securely stored in Google Firebase Firestore with real-time synchronization across devices.
- **Multi-Site Management**: Create, edit, and manage multiple construction sites with independent payment rates and configurations.
- **Daily Attendance Tracking**: Log worker and laborer attendance with an intuitive counter interface.
- **Dynamic Cost Logging**: Add and track unlimited daily expenses (materials, equipment rental, etc.) with automatic categorization.
- **Real-Time Financial Calculations**: Automatic computation of daily and weekly payment totals.
- **Weekly Grouped History**: View comprehensive records organized by week with running totals and analytics.
- **Professional PDF Export**: Generate detailed PDF reports with weekly summaries and financial breakdowns.
- **Image Export**: Share weekly summaries as JPG images for quick distribution via messaging platforms.
- **Fully Responsive Design**: Optimized for desktop, tablet, and mobile devices with adaptive UI components.
- **Real-Time Updates**: Changes sync instantly across all user sessions using Firestore listeners.
- **Comprehensive Settings**: User account management, data privacy controls, and secure data deletion options.

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15.3.3 with App Router & Turbopack |
| **Language** | TypeScript |
| **Backend/Database** | Google Firebase (Authentication, Firestore, Cloud Storage) |
| **Frontend UI** | ShadCN UI + Radix UI Components |
| **Styling** | Tailwind CSS with custom animations |
| **State Management** | React Hooks, Firebase Hooks, React Context API |
| **Form Handling** | React Hook Form with Zod validation |
| **PDF Generation** | jsPDF + jsPDF-AutoTable |
| **Image Processing** | html-to-image |
| **Password Security** | bcryptjs (10-round hashing) |
| **Date/Time** | date-fns |
| **Icons** | Lucide React |
| **PWA Support** | next-pwa |

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm (or yarn/pnpm)
- **Firebase Project**: Set up a Firebase project at [firebase.google.com](https://firebase.google.com)
- **Environment Variables**: Firebase configuration keys (see Setup section)

### Installation

1. **Clone or Download the Repository**
   ```bash
   git clone <repository-url>
   cd Manager-Pro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the root directory and add your Firebase configuration:
   
   ```bash
   # Firebase Web Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Admin/Deletion Scripts (Optional)
   SERVICE_ACCOUNT_PATH=/path/to/service-account.json
   FIREBASE_PROJECT_ID=your_project_id
   ```

   > **Note**: Obtain these values from your Firebase project settings. `NEXT_PUBLIC_*` variables are safe to expose in the client bundle.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:9002`

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Available Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start development server with Turbopack (port 9002) |
| `npm run build` | Build optimized production bundle |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run typecheck` | Verify TypeScript type safety |
| `npm run firestore:delete-dailyRecords` | Admin script to safely delete all work records (dry-run mode by default) |

## Application Workflow

### 1. Authentication (Login/Signup)
- Users enter a name and password to create or access their account
- Passwords are securely hashed using bcryptjs (10 rounds)
- Authentication persists across browser sessions

### 2. Dashboard (Work Sites)
- View all created work sites
- Create new sites with custom daily payment rates
- Quick actions for editing, accessing, or deleting sites

### 3. Site Management
- Log daily worker attendance and labor costs
- Add unlimited miscellaneous expenses with descriptions
- Update payment rates dynamically
- Real-time calculations for daily and weekly totals

### 4. History & Reports
- View all past records grouped by week
- Export comprehensive PDF reports with financial summaries
- Share weekly summaries as JPG images
- Filter and search historical data

### 5. Settings & Account Management
- Change account settings
- Clear all personal data (with confirmation)
- Secure logout

## Database Architecture (Firestore)

```
users/
├── {uid}/
│   ├── id: string
│   ├── name: string
│   ├── password: string (hashed)
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── places/ (subcollection)
│       ├── {placeId}/
│       │   ├── id: string
│       │   ├── name: string
│       │   ├── workerRate: number
│       │   ├── laborerRate: number
│       │   ├── createdAt: timestamp
│       │   ├── updatedAt: timestamp
│       │   └── dailyRecords/ (subcollection)
│       │       ├── {recordId}/
│       │       │   ├── id: string
│       │       │   ├── date: string (YYYY-MM-DD)
│       │       │   ├── workerCount: number
│       │       │   ├── laborerCount: number
│       │       │   ├── additionalCosts: array
│       │       │   ├── createdAt: timestamp
│       │       │   └── updatedAt: timestamp
```

## Security Considerations

- **Password Security**: Passwords are hashed using bcryptjs with 10 rounds before storage
- **Firebase Security Rules**: Configure Firestore rules to restrict user access to their own data only
- **Environment Variables**: Never commit `.env` with sensitive keys to version control
- **HTTPS Only**: Always deploy to HTTPS-enabled platforms (Vercel, Firebase Hosting, etc.)
- **Service Accounts**: Keep service account JSON files private and never commit to repositories

## Deployment

### Vercel (Recommended for Next.js)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with one click

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Build: `npm run build`
3. Deploy: `firebase deploy`

## File Structure

```
src/
├── app/
│   ├── (auth) / page.tsx              # Login/Signup page
│   ├── places/
│   │   ├── page.tsx                   # Work sites dashboard
│   │   └── [id]/
│   │       ├── page.tsx               # Site detail & management
│   │       └── history/ page.tsx      # Weekly history & reports
│   ├── settings/ page.tsx             # User settings
│   ├── layout.tsx                     # Root layout with providers
│   └── globals.css                    # Global styles
├── components/
│   ├── layout/ Header.tsx             # Navigation header
│   ├── places/                        # Site management components
│   ├── records/                       # Record & history components
│   ├── ui/                            # ShadCN UI components
│   └── FirebaseErrorListener.tsx      # Global error handler
├── firebase/
│   ├── config.ts                      # Firebase initialization
│   ├── index.ts                       # Custom hooks & utilities
│   ├── provider.tsx                   # Firebase context providers
│   └── firestore/                     # Firestore hooks
├── hooks/                             # Custom React hooks
├── lib/
│   ├── types.ts                       # TypeScript interfaces
│   ├── utils.ts                       # Helper functions
│   └── pdf-generator.ts               # PDF export logic
├── ai/                                # Genkit AI integration (optional)
└── public/                            # Static assets
```

## Troubleshooting

### Common Issues

**Issue**: "Firebase service is not available"
- **Solution**: Verify `.env` file contains correct Firebase credentials

**Issue**: "Permission denied" errors
- **Solution**: Check Firestore security rules allow user access to their own data

**Issue**: Password hashing errors
- **Solution**: Ensure bcryptjs is installed: `npm install bcryptjs`

**Issue**: Build fails with TypeScript errors
- **Solution**: Run `npm run typecheck` to identify issues; fix and rebuild

## Performance Optimizations

- **Turbopack**: Fast compilation and HMR in development
- **Firebase Caching**: Automatic client-side caching for better performance
- **Image Optimization**: Next.js Image component for responsive images
- **Code Splitting**: Automatic by Next.js App Router
- **PWA Support**: Offline capability and app-like experience

## Contributing

For bug reports, feature requests, or contributions, please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See `LICENSE` file for details.

## Support

For support, issues, or questions:
- Email: support@managerpro.app
- GitHub Issues: [Create an issue](https://github.com/yourusername/manager-pro/issues)
- Documentation: [Full docs](https://docs.managerpro.app)

---

**Manager Pro** — Empowering construction professionals with intelligent project management.

*Built with ❤️ using Next.js, Firebase, and TypeScript*
