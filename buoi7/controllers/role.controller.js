const Role = require('../models/role.model');

class RoleController {
  // Get all roles (combined from both projects)
  async getAllRoles(req, res) {
    try {
      const roles = await Role.find({ isDeleted: false });
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get role by ID (combined from both projects)
  async getRoleById(req, res) {
    try {
      const role = await Role.findOne({ 
        _id: req.params.id, 
        isDeleted: false 
      });
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      res.json(role);
    } catch (error) {
      res.status(404).json({ message: 'Role not found' });
    }
  }

  // Create role (combined from both projects)
  async createRole(req, res) {
    try {
      const role = new Role({
        name: req.body.name,
        description: req.body.description
      });
      await role.save();
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update role (combined from both projects)
  async updateRole(req, res) {
    try {
      const role = await Role.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      
      if (!role || role.isDeleted) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      res.json(role);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Soft delete role (combined from both projects)
  async deleteRole(req, res) {
    try {
      const role = await Role.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      );
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new RoleController();