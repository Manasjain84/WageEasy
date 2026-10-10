# 🏡 WanderLust

WanderLust is a full-stack web application inspired by Airbnb that allows users to discover, create, and manage property listings for different destinations.

The application provides a platform where users can explore places to stay, upload listing images, organize properties by category, and share their experiences through reviews.

## ✨ Features

- **Browse Listings:** Explore available properties and view their details.
- **Search Destinations:** Search listings by title, location, or country.
- **Category Filters:** Filter listings by categories such as Mountains, Rooms, Castles, Amazing Views, and more.
- **User Authentication:** Sign up, log in, and log out securely.
- **Create Listings:** Authenticated users can add new property listings with images.
- **Edit and Delete Listings:** Listing owners can manage their own properties.
- **Reviews and Ratings:** Users can add reviews to listings.
- **Image Uploads:** Store listing images using Cloudinary.
- **Flash Messages:** Display success and error messages for user actions.
- **Responsive UI:** Browse the application across different screen sizes.

## 🛠️ Tech Stack

**Frontend**
- HTML, CSS, JavaScript
- EJS templating
- Bootstrap

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose

**Authentication and Security**
- Passport.js
- Express Session
- Connect Mongo
- Joi validation

**Image Storage**
- Cloudinary
- Multer
- Multer Storage Cloudinary

## 📁 Project Structure

```text
WanderLust/
├── controllers/
├── models/
├── routes/
├── views/
│   ├── includes/
│   ├── layouts/
│   └── listings/
├── public/
│   ├── css/
│   └── js/
├── utils/
├── app.js
├── middleware.js
├── schema.js
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd WanderLust
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your GitHub repository URL.

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` option may be required for this project's current dependency versions.

### 3. Configure environment variables

Create a `.env` file in the project root and add the following variables:

```env
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD-API-SECRET=your_cloudinary_api_secret
```

Replace the placeholder values with your own credentials.

**Important:** Never commit your `.env` file or expose database passwords, session secrets, or Cloudinary credentials publicly.

### 4. Start the application

```bash
node app.js
```

Open the following URL in your browser:

```text
http://localhost:8080
```

## ☁️ Deployment

WanderLust is deployed using Render.

- **Application Hosting:** Render
- **Database:** MongoDB Atlas
- **Image Storage:** Cloudinary
- **Source Code:** GitHub

Configure the required environment variables in Render before deploying.

## 🚀 Future Improvements

- Map-based property discovery
- Advanced search and sorting
- Wishlist functionality
- Pagination for listings
- Improved mobile experience

## 👨‍💻 Author

Developed as a full-stack web development project to practice backend development, database integration, authentication, image uploads, and deployment.
