# StreamHub - IPTV Management Platform

A modern, multilingual IPTV management platform that allows users to manage their Xtreme Code API and M3U playlist accounts. Built with React, TypeScript, and Node.js.

## 🌟 Features

### Core Features
- **Xtreme Code API Integration**: Connect and manage multiple Xtreme Code accounts
- **M3U Playlist Support**: Load and manage M3U playlist files
- **Multi-Account Management**: Add, edit, and delete multiple IPTV accounts
- **Live TV Streaming**: Watch live TV channels with HLS.js player
- **Channel Organization**: Browse channels by categories
- **Account Caching**: Fast loading with localStorage caching

### User Features
- **User Authentication**: Secure login/register system with JWT
- **User Dashboard**: Manage personal IPTV accounts
- **Admin-Assigned Packages**: Receive and use IPTV packages assigned by administrators
- **Account History**: Track last used and creation dates

### Admin Features
- **User Management**: View and manage all users
- **Package Assignment**: Assign IPTV packages to users
- **Multi-Account Assignment**: Assign multiple Xtreme Code accounts to users
- **Package Editing**: Edit assigned packages (end date, channel count, quality, etc.)

### Internationalization
- **4 Languages Supported**: Turkish, English, Russian, Azerbaijani
- **Path-Based URLs**: SEO-friendly language routing (e.g., `/en/terms`, `/az/privacy`)
- **Dynamic Content**: All UI elements, legal pages, and error messages translated

### SEO & Legal
- **SEO Optimized**: Meta tags, structured data (Schema.org), sitemap.xml, robots.txt
- **Hreflang Tags**: Multi-language SEO support
- **Terms of Service**: Comprehensive legal terms in all languages
- **Privacy Policy**: GDPR-compliant privacy policy in all languages
- **Support Center**: Contact form and FAQ section

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **React i18next** - Internationalization
- **HLS.js** - Video streaming

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database (Mongoose)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client

## 📁 Project Structure

```
├── Client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── i18n/          # Internationalization
│   │   ├── services/      # API services
│   │   └── ...
│   └── public/
│       ├── sitemap.xml
│       └── robots.txt
│
└── Server/                 # Backend API
    ├── routes/            # API routes
    ├── models/           # Database models
    ├── middleware/       # Auth middleware
    └── server.js         # Entry point
```

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the Server directory:
```bash
cd Server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Server directory:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/iptv-manager
JWT_SECRET=your-secret-key-here
VITE_API_URL=http://localhost:3001
```

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

### Frontend Setup

1. Navigate to the Client directory:
```bash
cd Client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Client directory (optional):
```env
VITE_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 📖 Usage

### Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Default Routes

- Home: `/` or `/tr` (redirects to Turkish)
- Xtreme Code Login: `/tr/xtreme-code`
- M3U Playlist: `/tr/m3u-playlist`
- User Panel: `/tr/user`
- Admin Panel: `/t4br1z` (not multi-language)
- Support: `/tr/support`
- Terms: `/tr/terms`
- Privacy: `/tr/privacy`

### Language Routes

All routes support language prefixes:
- Turkish: `/tr/...`
- English: `/en/...`
- Russian: `/ru/...`
- Azerbaijani: `/az/...`

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Register**: Create a new account
2. **Login**: Get JWT token
3. **Protected Routes**: Admin panel and user panel require authentication
4. **Token Storage**: Tokens stored in localStorage

## 🌍 Internationalization

### Adding a New Language

1. Create a new JSON file in `Client/src/i18n/locales/` (e.g., `fr.json`)
2. Copy the structure from `tr.json`
3. Translate all keys
4. Update `Client/src/i18n/config.ts` to include the new language
5. Update `App.tsx` routing to include the new language

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:userId/xtreme-code` - Add Xtreme Code account
- `PUT /api/users/:userId/xtreme-code/:accountId` - Update Xtreme Code account
- `DELETE /api/users/:userId/xtreme-code/:accountId` - Delete Xtreme Code account
- `PUT /api/users/:userId/package` - Assign/Update IPTV package

## 🎨 Styling

The project uses Tailwind CSS for styling. Custom colors and themes are defined in `tailwind.config.js`.

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS protection
- Input validation
- Secure API endpoints with authentication middleware

## 📄 License

Copyright (c) 2024 StreamHub - IPTV Management Platform

All rights reserved.

This software and associated documentation files (the "Software") are the proprietary and confidential information of StreamHub. Unauthorized copying, modification, distribution, or use of this Software, via any medium, is strictly prohibited.

### Terms

1. **Proprietary Software**: This Software is proprietary and confidential. You may not use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software without explicit written permission.

2. **Restrictions**: 
   - You may not reverse engineer, decompile, or disassemble the Software
   - You may not remove or alter any proprietary notices or labels
   - You may not use the Software for any illegal or unauthorized purpose

3. **No Warranty**: The Software is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.

4. **Limitation of Liability**: In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.

5. **Contact**: For licensing inquiries, please contact the project maintainer.

---

**This license applies to all files in this repository unless otherwise stated.**