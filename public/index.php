<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Router.php';

use App\Router;
use App\Models\Ticket;
use App\Models\User;
use App\Database;

// Initialize the router
$router = new Router();

// Define routes
$router->get('/', function() {
    return renderTemplate('landing.twig');
});

$router->get('/auth/login', function() {
    return renderTemplate('auth/login.twig');
});

$router->get('/auth/signup', function() {
    return renderTemplate('auth/signup.twig');
});

$router->get('/dashboard', function() {
    try {
        $ticketModel = new Ticket();
        $stats = $ticketModel->getStats();
        $recentTickets = array_slice($ticketModel->getAll(), 0, 5);
        
        return renderTemplate('dashboard.twig', [
            'stats' => $stats,
            'recent_tickets' => $recentTickets
        ]);
    } catch (Exception $e) {
        // Fallback to static dashboard if database fails
        return renderTemplate('dashboard.twig', [
            'stats' => ['total' => 0, 'open' => 0, 'in_progress' => 0, 'closed' => 0],
            'recent_tickets' => []
        ]);
    }
});

$router->get('/tickets', function() {
    try {
        $ticketModel = new Ticket();
        $userModel = new User();
        
        $tickets = $ticketModel->getAll();
        $users = $userModel->getAll();
        
        return renderTemplate('tickets-dashboard.twig', [
            'tickets' => $tickets,
            'users' => $users
        ]);
    } catch (Exception $e) {
        // Fallback to static tickets if database fails
        return renderTemplate('tickets-dashboard.twig', [
            'tickets' => [],
            'users' => []
        ]);
    }
});

$router->get('/tickets/list', function() {
    return renderTemplate('tickets.twig');
});

$router->get('/notifications', function() {
    return renderPlaceholder('Notifications', 'Manage your notification preferences and view recent alerts.');
});

// Product routes
$router->get('/analytics', function() {
    return renderPlaceholder('Analytics', 'View detailed analytics and reports for your tickets.');
});

$router->get('/integrations', function() {
    return renderPlaceholder('Integrations', 'Connect with your favorite tools and services.');
});

$router->get('/api', function() {
    return renderPlaceholder('API Documentation', 'Explore our comprehensive API documentation.');
});

// Company routes
$router->get('/about', function() {
    return renderPlaceholder('About Us', 'Learn more about our mission and team.');
});

$router->get('/careers', function() {
    return renderPlaceholder('Careers', 'Join our team and help build the future of ticket management.');
});

$router->get('/blog', function() {
    return renderPlaceholder('Blog', 'Read the latest news, tips, and insights from our team.');
});

$router->get('/press', function() {
    return renderPlaceholder('Press', 'Media resources and press releases.');
});

$router->get('/contact', function() {
    return renderPlaceholder('Contact', 'Get in touch with our team.');
});

// Support routes
$router->get('/help', function() {
    return renderPlaceholder('Help Center', 'Find answers to common questions and issues.');
});

$router->get('/docs', function() {
    return renderPlaceholder('Documentation', 'Comprehensive guides and tutorials.');
});

$router->get('/community', function() {
    return renderPlaceholder('Community', 'Join our community forum and connect with other users.');
});

$router->get('/status', function() {
    return renderPlaceholder('System Status', 'Check the current status of our services.');
});

$router->get('/support', function() {
    return renderPlaceholder('Contact Support', 'Reach out to our support team for assistance.');
});

// Legal routes
$router->get('/privacy', function() {
    return renderPlaceholder('Privacy Policy', 'Learn how we protect and handle your data.');
});

$router->get('/terms', function() {
    return renderPlaceholder('Terms of Service', 'Read our terms and conditions.');
});

$router->get('/cookies', function() {
    return renderPlaceholder('Cookie Policy', 'Understand how we use cookies.');
});

$router->get('/security', function() {
    return renderPlaceholder('Security', 'Learn about our security practices and measures.');
});

// API Routes
$router->get('/api/tickets', function() {
    header('Content-Type: application/json');
    $ticketModel = new Ticket();
    echo json_encode($ticketModel->getAll());
});

$router->post('/api/tickets', function() {
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);
    
    $ticketModel = new Ticket();
    $id = $ticketModel->create($data);
    
    echo json_encode(['success' => true, 'id' => $id]);
});

$router->get('/api/tickets/stats', function() {
    header('Content-Type: application/json');
    $ticketModel = new Ticket();
    echo json_encode($ticketModel->getStats());
});

// Authentication routes
$router->post('/auth/login', function() {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $userModel = new User();
    $user = $userModel->authenticate($email, $password);
    
    if ($user) {
        session_start();
        $_SESSION['user'] = $user;
        header('Location: /dashboard');
    } else {
        header('Location: /auth/login?error=1');
    }
    exit;
});

$router->post('/auth/signup', function() {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $userModel = new User();
    
    // Check if user already exists
    if ($userModel->getByEmail($email)) {
        header('Location: /auth/signup?error=exists');
        exit;
    }
    
    $userId = $userModel->create([
        'name' => $name,
        'email' => $email,
        'password' => $password
    ]);
    
    if ($userId) {
        session_start();
        $_SESSION['user'] = $userModel->getById($userId);
        header('Location: /dashboard');
    } else {
        header('Location: /auth/signup?error=1');
    }
    exit;
});

// Newsletter subscription
$router->post('/newsletter', function() {
    // In a real app, this would save to database
    header('Location: /?subscribed=true');
    exit;
});

// Handle the request
$router->handleRequest();

/**
 * Render a Twig template
 */
function renderTemplate($template, $data = []) {
    $loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../templates');
    $twig = new \Twig\Environment($loader, [
        'cache' => false, // Disable cache for development
        'debug' => true,
    ]);
    
    try {
        echo $twig->render($template, $data);
    } catch (\Twig\Error\LoaderError $e) {
        http_response_code(404);
        echo "Template not found: " . $template;
    } catch (Exception $e) {
        http_response_code(500);
        echo "Error rendering template: " . $e->getMessage();
    }
}

/**
 * Render a placeholder page for unimplemented features
 */
function renderPlaceholder($title, $description) {
    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$title} - Ticket Management App</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 3rem;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
        }
        h1 {
            font-size: 2.5rem;
            color: #1e293b;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.125rem;
            color: #64748b;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        .badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 2rem;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
            margin: 0.5rem;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }
        .btn-secondary:hover {
            background: #f8fafc;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🚧</div>
        <span class="badge">Coming Soon</span>
        <h1>{$title}</h1>
        <p>{$description}</p>
        <p style="font-size: 0.95rem; color: #94a3b8;">This feature is currently under development and will be available soon.</p>
        <div style="margin-top: 2rem;">
            <a href="/" class="btn">Go to Home</a>
            <a href="/dashboard" class="btn btn-secondary">Go to Dashboard</a>
        </div>
    </div>
</body>
</html>
HTML;
    echo $html;
}