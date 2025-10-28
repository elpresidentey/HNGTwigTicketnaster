# Twig Ticket Management Web App

A server-rendered ticket management application built with PHP, Twig templating engine, and vanilla JavaScript.

## Features

- Server-side rendering with Twig templates
- Client-side interactivity with vanilla JavaScript
- LocalStorage-based authentication simulation
- Full CRUD operations for ticket management
- Responsive design with Tailwind CSS
- Graceful degradation when JavaScript is disabled

## Requirements

- PHP 7.4 or higher
- Composer (for dependency management)

## Installation

1. Clone the repository
2. Install Composer if not already installed: https://getcomposer.org/download/
3. Install dependencies:
   ```bash
   composer install
   ```

4. Start the PHP development server:
   ```bash
   php -S localhost:8000 -t public
   ```

4. Open your browser and navigate to `http://localhost:8000`

## Project Structure

```
├── public/                 # Web root directory
│   ├── index.php          # Application entry point
│   └── assets/            # Static assets
│       ├── css/           # Stylesheets
│       ├── js/            # JavaScript modules
│       └── hero-wave.svg  # Hero background SVG
├── src/                   # PHP source code
│   └── Router.php         # Custom routing class
├── templates/             # Twig templates
│   ├── base.twig         # Base template
│   ├── landing.twig      # Landing page
│   ├── auth/             # Authentication templates
│   ├── dashboard.twig    # Dashboard
│   └── tickets.twig      # Ticket management
├── vendor/               # Composer dependencies
└── composer.json         # Composer configuration
```

## Test Credentials

For testing the authentication simulation:
- Username: `testuser`
- Password: `password123`

## Development

The application uses:
- **PHP** with custom routing for server-side logic
- **Twig** for templating and server-side rendering
- **Vanilla JavaScript** (ES6 modules) for client-side interactivity
- **LocalStorage** for simulating authentication and data persistence
- **CSS** (will use Tailwind CSS or custom SCSS) for styling

## Browser Support

- Modern browsers with ES6 support
- Graceful degradation for older browsers
- Works without JavaScript (limited functionality)

## License

MIT License