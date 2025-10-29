<?php

namespace App;

use App\Models\Ticket;
use App\Models\User;

class Router {
    private $routes = [];
    
    /**
     * Add a GET route
     */
    public function get($path, $callback) {
        $this->routes['GET'][$path] = $callback;
    }
    
    /**
     * Add a POST route
     */
    public function post($path, $callback) {
        $this->routes['POST'][$path] = $callback;
    }
    
    /**
     * Handle the incoming request
     */
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove trailing slash except for root
        if ($path !== '/' && substr($path, -1) === '/') {
            $path = rtrim($path, '/');
        }
        
        if (isset($this->routes[$method][$path])) {
            $callback = $this->routes[$method][$path];
            
            if (is_callable($callback)) {
                return $callback();
            }
        }
        
        // 404 Not Found
        http_response_code(404);
        echo "404 - Page Not Found";
    }
}