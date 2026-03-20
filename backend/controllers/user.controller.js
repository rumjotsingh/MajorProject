import User from '../models/User.model.js';
import { validateObjectId } from '../utils/validation.util.js';

// GET /users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').limit(100);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /users/:id
export const getUserById = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'User ID');
    
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && req.user.userId.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id
export const updateUser = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'User ID');
    
    const { name, password, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    const isSelf = req.user.userId.toString() === req.params.id;
    const isAdmin = req.user.role === 'Admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (name) user.name = name;
    if (password) user.passwordHash = password;
    if (role && isAdmin) user.role = role;

    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, 'User ID');
    
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// PUT /users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /users/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

