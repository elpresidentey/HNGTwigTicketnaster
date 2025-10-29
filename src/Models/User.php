<?php

namespace App\Models;

use App\Database;

class User
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll()
    {
        return $this->db->fetchAll("SELECT id, name, email, created_at FROM users ORDER BY name");
    }

    public function getById($id)
    {
        return $this->db->fetch("SELECT id, name, email, created_at FROM users WHERE id = ?", [$id]);
    }

    public function getByEmail($email)
    {
        return $this->db->fetch("SELECT * FROM users WHERE email = ?", [$email]);
    }

    public function create($data)
    {
        $sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        
        $this->db->query($sql, [
            $data['name'],
            $data['email'],
            password_hash($data['password'], PASSWORD_DEFAULT)
        ]);

        return $this->db->lastInsertId();
    }

    public function authenticate($email, $password)
    {
        $user = $this->getByEmail($email);
        
        if ($user && password_verify($password, $user['password'])) {
            // Remove password from returned data
            unset($user['password']);
            return $user;
        }
        
        return false;
    }

    public function update($id, $data)
    {
        $sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
        
        return $this->db->query($sql, [
            $data['name'],
            $data['email'],
            $id
        ]);
    }

    public function delete($id)
    {
        return $this->db->query("DELETE FROM users WHERE id = ?", [$id]);
    }
}