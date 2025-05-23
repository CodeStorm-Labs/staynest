# StayNest 🏠

A modern, full-featured vacation rental platform built with Next.js, similar to Airbnb. StayNest allows hosts to list their properties and guests to discover and book unique accommodations.

## ✨ Features

### 🔐 **Authentication & User Management**
- Complete user authentication system with Better Auth
- User roles (admin, user, host) and tiers (free, pro)
- Secure login/signup with session management

### 🏠 **Property Management**
- Full CRUD operations for property listings
- Multiple property types: Apartment, House, Unique, Hotel
- Image upload and gallery management
- Interactive location picker with maps
- Property-specific amenities and details

### 🔍 **Advanced Search & Filtering**
- Location-based search with autocomplete
- Filter by property type, price range, amenities
- Date-based availability checking
- Sorting options (price, newest, ratings)

### 📅 **Booking System**
- Complete booking workflow with calendar
- Guest count selection and validation
- Booking status management (Pending, Confirmed, Cancelled)
- Booking cancellation with policies

### ⭐ **Review & Rating System**
- Guest reviews with 1-5 star ratings
- Review validation (only after checkout)
- Average rating calculation
- Host response capabilities

### 🎯 **User Dashboard**
- Personal booking management
- Host dashboard for property management
- Revenue tracking and analytics
- Booking calendar management

### 🛡️ **Admin Panel**
- Complete admin interface for platform management
- User, listing, and booking administration
- Platform analytics and reporting
- System settings management

### 🗺️ **Maps & Location**
- Interactive maps for property display
- Location picker for hosts
- Nearby listings discovery
- Map-based search functionality

### 🌍 **Internationalization**
- Multi-language support (Turkish/English)
- Localized content and date formatting
- Currency localization

### 💳 **Payment Integration**
- Secure payment processing with Stripe
- Service fee calculation (12% platform fee)
- Payment intent creation and confirmation
- Webhook handling for payment verification
- Dual booking options (free booking vs. paid booking)

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **Maps**: Leaflet, OpenStreetMap
- **UI Components**: Custom components with Tailwind
- **File Upload**: Next.js file handling
- **Date Handling**: date-fns with Material-UI DatePicker

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CodeStorm-Labs/staynest.git
   cd staynest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/staynest"
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   BETTER_AUTH_SECRET="your-super-secret-key-here"
   BETTER_AUTH_URL="http://localhost:3000"
   
   # Stripe Configuration (for payment processing)
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
   ```

4. **Start the database**
   ```bash
   docker-compose up -d
   ```

5. **Push the database schema**
   ```bash
   npm run db:push
   ```

6. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Default Admin Access

After seeding the database, you can log in as admin:
- **Email**: admin@example.com
- **Password**: admin123

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 app router
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API endpoints
│   └── (auth)/            # Authentication pages
├── components/            # Reusable React components
├── db/                    # Database schema and utilities
├── lib/                   # Utility functions and configurations
├── locales/              # Translation files
└── store/                # State management
```

## 🗃️ Database Schema

The application uses a robust relational database schema:

- **Users**: Authentication, roles, and profile information
- **Listings**: Property details, pricing, and metadata
- **Bookings**: Reservation management and status tracking
- **Reviews**: Rating and feedback system
- **Images**: Property photo management
- **Amenities**: Property features and facilities

## 🚧 Upcoming Features

- [ ] Real-time messaging between hosts and guests
- [ ] Email notification system
- [ ] Advanced calendar management
- [ ] Mobile app support
- [ ] Social authentication (Google, Facebook)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love using modern web technologies
- Inspired by the sharing economy and travel industry
- Thanks to the open-source community for amazing tools and libraries

---

**StayNest** - Making every stay memorable ✨
