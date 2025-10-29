<?php

namespace App\Models;

use App\Database;

class Ticket
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll()
    {
        return $this->db->fetchAll("
            SELECT t.*, 
                   u1.name as assigned_name,
                   u2.name as created_by_name
            FROM tickets t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            ORDER BY t.created_at DESC
        ");
    }

    public function getById($id)
    {
        return $this->db->fetch("
            SELECT t.*, 
                   u1.name as assigned_name,
                   u2.name as created_by_name
            FROM tickets t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            WHERE t.id = ?
        ", [$id]);
    }

    public function getByStatus($status)
    {
        return $this->db->fetchAll("
            SELECT t.*, 
                   u1.name as assigned_name,
                   u2.name as created_by_name
            FROM tickets t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            WHERE t.status = ?
            ORDER BY t.created_at DESC
        ", [$status]);
    }

    public function create($data)
    {
        $sql = "INSERT INTO tickets (title, description, status, priority, assigned_to, created_by) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $this->db->query($sql, [
            $data['title'],
            $data['description'],
            $data['status'] ?? 'open',
            $data['priority'] ?? 'medium',
            $data['assigned_to'] ?? null,
            $data['created_by']
        ]);

        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE tickets SET 
                title = ?, 
                description = ?, 
                status = ?, 
                priority = ?, 
                assigned_to = ?,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = ?";
        
        return $this->db->query($sql, [
            $data['title'],
            $data['description'],
            $data['status'],
            $data['priority'],
            $data['assigned_to'],
            $id
        ]);
    }

    public function delete($id)
    {
        return $this->db->query("DELETE FROM tickets WHERE id = ?", [$id]);
    }

    public function getStats()
    {
        $stats = [];
        
        // Total tickets
        $stats['total'] = $this->db->fetch("SELECT COUNT(*) as count FROM tickets")['count'];
        
        // By status
        $statusCounts = $this->db->fetchAll("
            SELECT status, COUNT(*) as count 
            FROM tickets 
            GROUP BY status
        ");
        
        foreach ($statusCounts as $status) {
            $stats[$status['status']] = $status['count'];
        }
        
        // By priority
        $priorityCounts = $this->db->fetchAll("
            SELECT priority, COUNT(*) as count 
            FROM tickets 
            GROUP BY priority
        ");
        
        foreach ($priorityCounts as $priority) {
            $stats['priority_' . $priority['priority']] = $priority['count'];
        }
        
        return $stats;
    }
}