# MERNova – CampusCart

## What is included
- React + Vite web application
- Node.js + Express backend
- MongoDB + Mongoose product storage
- Product validation and CRUD
- Buy Now / sold status
- Campus meeting spots: Admin Block, Fountain, Ground, D Block, L Block, DSA
- Signup validation: name = letters/spaces only; phone = exactly 10 digits

## Run without confusion

### Terminal 1 – backend
From the project root:

```powershell
cd backend
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

### MongoDB
Make sure MongoDB is running locally on port 27017. The included `backend/.env` uses:

```env
MONGODB_URI=mongodb://localhost:27017/campuscart
PORT=5000
```

You can open MongoDB Compass and connect to `mongodb://localhost:27017`.

### Terminal 2 – frontend
Open a second terminal at the project root:

```powershell
npm install
npm run dev
```

The React app runs at `http://localhost:3000`.

## Important
Start the backend first. Then start the frontend. The frontend uses the REST API at `/api`, and Vite proxies `/api` to port 5000.

## MongoDB data flow

```text
React Web
   ↓
Vite /api proxy
   ↓
Node.js + Express
   ↓
Mongoose
   ↓
MongoDB
```

Creating, editing, deleting, and marking a product as sold use the backend API and are saved in MongoDB.


## Clean CampusCart setup

### 1. Install frontend
```bash
npm install
npm run dev
```

### 2. Install and run backend
Open a second terminal:
```bash
cd backend
npm install
npm run dev
```

### 3. MongoDB
Set `MONGODB_URI` in `backend/.env` and make sure MongoDB is running.

Product listings are stored in MongoDB through the Express API.

### 4. Start with a clean product database
If an earlier version of CampusCart created demo products, clear them once:
```bash
cd backend
npm run clear-products
```
This deletes only the `products` collection data. Do this only when you want a clean demo database.

### 5. Login (JWT) and admin access
Login uses JSON Web Tokens (JWT), issued by the Express backend and stored in MongoDB-backed accounts.

- **Sign Up** (`POST /api/auth/register`) saves the account in MongoDB with the password stored only as a bcrypt hash, then returns a JWT.
- **Login** (`POST /api/auth/login`) checks the email and password on the server and returns a JWT (valid for `JWT_EXPIRES_IN`, default 2 hours).
- The React app keeps the token and sends it as `Authorization: Bearer <token>` on every API call. `GET /api/auth/me` confirms a token is still valid.
- **Protected routes:** creating, editing, deleting and marking listings as sold need a valid token. Only the seller or an admin can edit or delete a listing; any signed-in student can still use **Buy Now**. Reading listings is public. `/api/products/bulk` can seed an empty database, but only an admin can replace existing listings.
- When the token expires (or the server rejects it) the app signs the user out with a "Session expired" message.

**Backend settings** (`backend/.env`, see `backend/.env.example`):
```env
JWT_SECRET=<long random string>   # required - the server will not start without it
JWT_EXPIRES_IN=2h
ADMIN_EMAIL=admin.01@presidencyuniversity.in
ADMIN_PASSWORD=admin123
```
Run `npm install` in `backend` once after updating (it adds `jsonwebtoken` and `bcryptjs`).

**Admin account:** created automatically in MongoDB the first time the backend starts (only if no admin exists yet). Default login: `admin.01@presidencyuniversity.in` / `admin123` (the same account the **Admin Demo** button uses). Change `ADMIN_PASSWORD` before the first start for anything beyond a demo. To reset the admin, delete the admin document from the `users` collection in MongoDB Compass and restart the backend.

**Students** register through Sign Up. Accounts created before JWT login was added only existed in the browser, so sign up again once. The **Student Demo** button signs in `navya.46@presidencyuniversity.in` with `campus123`, so create that account through Sign Up first if you want to use the button.

### Validation rules
- Full name: letters and spaces only.
- Phone: exactly 10 digits.
- Password: at least 6 alphanumeric characters with at least one letter and one number.
- Product name: 4–100 characters, must contain at least one letter.
- Product price: ₹1–₹1,00,000.
- Meetup spots: Admin Block, Fountain, Ground, D Block, L Block, DSA.
