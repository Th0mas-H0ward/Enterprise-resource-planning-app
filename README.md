📜 **This ERP system is designed to streamline and optimize resource management in an industrial company. It includes modules for order processing, supplier and product specification management, reporting, and production planning. The web interface provides role-based access control for different user types such as order managers and production planners.**

📋 _Project features_
- User authentication with role-based access;
- Product and specification management;
- Client order tracking and processing;
- Sales and production reporting;
- Reports generation and sending by e-mail;
- CSV import support for data entry.

🛠️ _Technologies_
- Node.js – Runtime environment for server-side JavaScript;
- Express.js – Web framework for routing and middleware;
- Handlebars.js – Templating engine for dynamic HTML rendering;
- MongoDB Atlas – Cloud database **(with private cluster connection)**;
- Mongoose – ODM for working with MongoDB;
- JavaScript – Core scripting language for logic;
- CSS – Interface styling;
- Materialize - Modern responsive CSS framework;
- Multer – Middleware for handling file uploads;
- Nodemailer - Makes sending email from a Node.js application;
- PDFKit - PDF document generation library for Node.

🌳 Project structure
```
erp-app/
│
├── index.js                   # Main application entry point
├── config.js                  # Configuration file 
│
├── controllers/               # Business logic for app routes
│   ├── authController.js          # Handles user authentication
│   ├── providerController.js      # Handles provider-related logic
│
├── middleware/               # Custom middleware for route protection
│   ├── auth.js                   # Authentication check
│   ├── checkRole.js              # Role-based access control
│
├── models/                   # Mongoose data models for MongoDB
│   ├── Material.js               # Material schema
│   ├── Order.js                  # Order schema
│   ├── Product.js                # Product schema
│   ├── Provider.js               # Provider schema
│   ├── Specification.js          # Specification schema
│   ├── User.js                   # User schema
│
├── routes/                   # Express route definitions
│   ├── authentication.js         # Auth routes (login, logout)
│   ├── materials.js              # CRUD for materials
│   ├── orders.js                 # Client order management
│   ├── prod-orders.js           # Production order tracking
│   ├── products.js              # Product data handling
│   ├── providers.js             # Providers and suppliers
│   ├── reports.js               # General report generation
│   ├── sales-reports.js         # Sales report routes
│   ├── specifications.js        # Product specifications
│
├── service/                  # Auxiliary service functions
│   ├── formatDate.js             # Utility to format date strings
│   ├── pdf-service.js            # PDF generation logic
│   ├── pdf-service-client.js     # Specialized PDF for client reports
│
├── views/                    # Handlebars templates for UI rendering
│   ├── index.hbs                 # Dashboard for authenticated users
│   ├── login.hbs                 # Login page
│   ├── client-orders-list.hbs    # List of client orders
│   ├── create-provider.hbs       # Provider creation form
│   ├── order.hbs                 # Order overview page
│   ├── order-details.hbs         # Detailed client order info
│   ├── order-specifications.hbs  # Specifications within an order
│   ├── orders-list.hbs           # Order manager view
│   ├── place-order.hbs           # Form for placing new orders
│   ├── prod-order-details.hbs    # Production-specific order details
│   ├── prod-orders-list.hbs      # Production orders overview
│   ├── products.hbs              # List of products
│   ├── provider-details.hbs      # Individual provider info
│   ├── providers.hbs             # Provider listing page
│   ├── reports.hbs               # General reporting view
│   ├── sales-reports.hbs         # Sales reports page
│   ├── specification-details.hbs # Specific specification view
│   ├── specifications.hbs        # Specification list
│   ├── layouts/                  # Reusable layout templates
│   │   ├── login-layout.hbs          # Layout for unauthenticated users
│   │   ├── main.hbs                  # Base layout
│   │   ├── order-mngr.hbs            # Order manager dashboard layout
│   │   ├── prod-plnr.hbs            # Production planner dashboard
│   ├── partials/                 # Shared template parts
│   │   ├── head.hbs                  # HTML head block
│   │   ├── navbar.hbs                # Common navbar
│   │   ├── order-mngr-navbar.hbs     # Navbar for order managers
│   │   ├── prod-plnr-navbar.hbs      # Navbar for production planners
│
├── public/                   # Static files accessible to frontend
│   ├── index.css                 # Main CSS file
│   ├── images/                   # Logos and static images
│   │   ├── logo.png, pdf-logo.png, etc.
│   ├── uploads/                  # Uploaded CSV files
│   │   ├── *.csv
│   ├── fonts/                    # Fonts for PDF rendering and styling
│   │   ├── djsans/                   # DejaVuSans font variants
│   │   ├── helvetica/                # Helvetica font variants
│
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Exact versions of installed dependencies
└── desktop.ini               # (System-generated file; can be ignored)
```
🔧 _Environment Configuration_
To connect the application to a MongoDB database, a personal cluster on MongoDB Atlas was used.
Ensure that your config.js file includes your MongoDB connection block, similar to:
```
module.exports = {
  mongodb: {
    mongodb+srv://{{username}}:<db_password>@cluster0.ibqjpdg.mongodb.net/
  },
  session: {
    secret: 'your-secret-key'
  }
}
```
🚀 _Getting Started_
1. Install dependencies:
```
npm install
```
2. Run the development server:
```
node index.js
```
3. Open your browser and go to:
```
http://localhost:8080/
```
