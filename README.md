# AI-Enhanced Nail Service Booking System (INBS)

## Project Overview
**English Name**: AI-Enhanced Nail Service Booking System  
**Vietnamese Name**: Hệ thống đặt lịch làm nail thông minh ứng dụng trí tuệ nhân tạo  
**Abbreviation**: INBS

## Project Context
The nail service booking process faces several key challenges:
- Customers struggle to choose nail designs that suit them without visualization
- Booking time slots is often inefficient, leading to long wait times
- Customers have difficulty describing their desired designs to nail artists
- Peak hours create booking conflicts and customer dissatisfaction
- Previous customer preferences are not effectively used for future bookings
- Last-minute cancellations create scheduling gaps and revenue loss

## Proposed Solutions
- AI-powered virtual nail try-on system to preview designs
- Smart booking system with intelligent time slot suggestions
- AI-based service time estimation for accurate scheduling
- Automated booking optimization for peak hours
- Design preference learning and recommendation system
- Intelligent rebooking system for cancelled appointments

## Functional Requirements

### Customer Mobile App
- User registration with preference setup
- Virtual nail try-on with AR technology
- AI design recommendations based on:
  - Past selections
  - Current trends
  - Skin tone
  - Season/occasion
- Intelligent booking features:
  - Smart time slot suggestions
  - Service duration estimation
  - Automatic artist matching
  - Waitlist management
- Automated reminder system
- Quick rebooking of favorite services
- In-app secure payment
- Design saving and sharing

### Artist Portal (Web)
- Real-time booking notifications
- Client preference viewing
- Service timing tracking for better future estimates
- Next appointment preview
- Break time management
- Simple availability updates

### Admin Booking Management
- Real-time booking dashboard
- Artist availability management
- Service time slot configuration
- Booking analytics for optimization
- Customer preference insights
- Waitlist management

## Technical Architecture

### Frontend
- Mobile App: React Native with Expo
- UI Components: React Native elements, Skia for graphics
- Navigation: Expo Router
- State Management: Context API with AsyncStorage

### Features Implemented
1. **Authentication System**
   - User registration and login
   - OTP verification

2. **Virtual Nail Try-on**
   - Camera integration with AR technology
   - Real-time nail design preview

3. **Booking System**
   - Store selection with location-based recommendations
   - Date and time slot selection
   - AI-powered service duration prediction
   - Artist matching and selection

4. **Design Selection**
   - Browsable nail design catalog
   - Favorites system
   - Design recommendations

5. **Scheduling**
   - Smart time slot suggestions
   - Service duration estimation
   - Automatic artist matching

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the app
   ```bash
   npx expo start
   ```

## Project Structure
- `/app` - Main application screens and routes
  - `/(authenticated)` - Screens for logged-in users
  - `/(unauthenticated)` - Authentication screens
  - `/nails` - Nail service specific screens
- `/components` - Reusable UI components
- `/services` - API and business logic
- `/assets` - Images, icons, and other static resources
- `/utils` - Helper functions and utilities

## Technologies Used
- React Native & Expo
- TypeScript
- TensorFlow.js for AI models
- Firebase Authentication
- Expo Camera for AR features
- React Native Skia for graphics processing
- Axios for API communication
