import { Router } from 'express';

const router = Router();

// In-memory user data for demo purposes
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@siyadah.ai',
    role: 'admin',
    status: 'active',
    lastLogin: new Date('2025-06-22T10:00:00Z'),
    createdAt: new Date('2025-01-01T00:00:00Z')
  },
  {
    id: 2,
    username: 'sales_manager',
    email: 'sales@siyadah.ai', 
    role: 'manager',
    status: 'active',
    lastLogin: new Date('2025-06-22T09:30:00Z'),
    createdAt: new Date('2025-02-15T00:00:00Z')
  },
  {
    id: 3,
    username: 'support_agent',
    email: 'support@siyadah.ai',
    role: 'agent',
    status: 'active',
    lastLogin: new Date('2025-06-22T08:45:00Z'),
    createdAt: new Date('2025-03-10T00:00:00Z')
  }
];

// Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// Get user by ID
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// Create new user
router.post('/', (req, res) => {
  const { username, email, role = 'agent' } = req.body;
  
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }
  
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    username,
    email,
    role,
    status: 'active',
    lastLogin: null,
    createdAt: new Date()
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { username, email, role, status } = req.body;
  const user = users[userIndex];
  
  if (username) user.username = username;
  if (email) user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;
  
  users[userIndex] = user;
  res.json(user);
});

// Delete user
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  res.json({ message: 'User deleted successfully' });
});

export default router;