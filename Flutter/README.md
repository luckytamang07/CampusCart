# CampusCart Flutter - Clean Demo Version

This is the Flutter mobile frontend for the MERNova / CampusCart project.

## Features
- Login and signup
- Dashboard
- Browse products
- Search and category filtering
- Product details
- Buy / mark product as sold through the existing backend
- Sell a product
- Orders screen
- Profile screen
- Bottom navigation

## Backend connection
The app currently uses:

http://192.168.0.139:5000/api

If the laptop's Wi-Fi IPv4 address changes, edit:

lib/services/api_service.dart

and change `baseUrl`.

## Run in Android Studio
1. Open this folder in Android Studio.
2. Open the terminal in the project folder.
3. Run `flutter pub get`.
4. If the `android` folder is missing, run `setup_android.bat` once.
5. Connect the Android phone and make sure it appears under `flutter devices`.
6. Run `flutter run -d <device-id>`.

## Backend
Make sure the MERNova backend is running on port 5000 and the phone and laptop are on the same Wi-Fi.
