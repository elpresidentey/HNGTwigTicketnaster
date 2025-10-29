<?php

namespace App;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $pdo;

    private function __construct()
    {
        // Use /tmp for Railway deployment (writable directory)
        $dbPath = '/tmp/tickets.db';
        
        // Fallback to local directory for development
        if (!is_writable('/tmp')) {
            $dbPath = __DIR__ . '/../database/tickets.db';
            $dbDir = dirname($dbPath);
            
            // Create database directory if it doesn't exist
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0755, true);
            }
        }

        try {
            $this->pdo = new PDO("sqlite:$dbPath");
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Create tables if they don't exist
            $this->createTables();
        } catch (PDOException $e) {
            throw new \Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->pdo;
    }

    private function createTables()
    {
        // Users table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // Tickets table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'open',
                priority VARCHAR(20) DEFAULT 'medium',
                assigned_to INTEGER,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        ");

        // Insert sample data if tables are empty
        $this->insertSampleData();
    }

    private function insertSampleData()
    {
        // Check if users exist
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM users");
        if ($stmt->fetchColumn() == 0) {
            // Insert sample users
            $users = [
                ['John Doe', 'john@example.com', password_hash('password123', PASSWORD_DEFAULT)],
                ['Sarah Smith', 'sarah@example.com', password_hash('password123', PASSWORD_DEFAULT)],
                ['Mike Johnson', 'mike@example.com', password_hash('password123', PASSWORD_DEFAULT)],
                ['Emily Davis', 'emily@example.com', password_hash('password123', PASSWORD_DEFAULT)]
            ];

            $stmt = $this->pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
            foreach ($users as $user) {
                $stmt->execute($user);
            }
        }

        // Check if tickets exist
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM tickets");
        if ($stmt->fetchColumn() == 0) {
            // Insert sample tickets
            $tickets = [
                ['Login page not responding', 'Users are unable to access the login page. Getting 500 error.', 'open', 'high', 1, 1],
                ['Update dashboard UI', 'Redesign the dashboard with modern UI components.', 'in_progress', 'medium', 2, 1],
                ['Add export feature', 'Allow users to export ticket data to CSV format.', 'open', 'low', 3, 2],
                ['Database optimization', 'Optimize database queries for better performance.', 'closed', 'high', 4, 2],
                ['Mobile responsive fixes', 'Fix layout issues on mobile devices.', 'in_progress', 'medium', 1, 3],
                ['Email notifications', 'Implement email notifications for ticket updates.', 'closed', 'low', 2, 3]
            ];

            $stmt = $this->pdo->prepare("
                INSERT INTO tickets (title, description, status, priority, assigned_to, created_by) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            foreach ($tickets as $ticket) {
                $stmt->execute($ticket);
            }
        }
    }

    public function query($sql, $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new \Exception("Query failed: " . $e->getMessage());
        }
    }

    public function fetchAll($sql, $params = [])
    {
        return $this->query($sql, $params)->fetchAll();
    }

    public function fetch($sql, $params = [])
    {
        return $this->query($sql, $params)->fetch();
    }

    public function lastInsertId()
    {
        return $this->pdo->lastInsertId();
    }
}