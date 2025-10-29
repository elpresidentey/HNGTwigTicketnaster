<?php
/**
 * Database initialization script
 * Run this once to set up the SQLite database with sample data
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Database;

try {
    echo "Initializing database...\n";
    
    // This will create the database and tables automatically
    $db = Database::getInstance();
    
    echo "✅ Database initialized successfully!\n";
    echo "📍 Database location: " . __DIR__ . "/database/tickets.db\n";
    echo "👥 Sample users created (password: password123)\n";
    echo "🎫 Sample tickets created\n";
    echo "\nYou can now run your application!\n";
    
} catch (Exception $e) {
    echo "❌ Error initializing database: " . $e->getMessage() . "\n";
    exit(1);
}