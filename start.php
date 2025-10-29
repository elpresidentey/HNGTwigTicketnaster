<?php
/**
 * Railway startup script
 * This ensures the database is initialized before starting the web server
 */

echo "Starting Ticket Management App...\n";

// Initialize database if it doesn't exist
$dbPath = __DIR__ . '/database/tickets.db';
if (!file_exists($dbPath)) {
    echo "Database not found, initializing...\n";
    
    try {
        require_once __DIR__ . '/vendor/autoload.php';
        $db = \App\Database::getInstance();
        echo "✅ Database initialized successfully!\n";
    } catch (Exception $e) {
        echo "⚠️ Database initialization failed: " . $e->getMessage() . "\n";
        echo "App will start without database...\n";
    }
}

// Start the PHP built-in server
$port = $_ENV['PORT'] ?? 8080;
$host = '0.0.0.0';
$docroot = __DIR__ . '/public';

echo "Starting server on {$host}:{$port}\n";
echo "Document root: {$docroot}\n";

// Use exec to replace the current process
exec("php -S {$host}:{$port} -t {$docroot}");