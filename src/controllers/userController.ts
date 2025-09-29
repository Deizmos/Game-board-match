import { Request, Response } from 'express';
import { User } from '../models/User';
import { Game } from '../models/Game';

// Get user profile by ID
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-password -email')
      .populate('favoriteGames', 'name imageUrl')
      .populate('gameHistory.game', 'name imageUrl');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { username, bio, location, preferences } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        username, 
        bio, 
        location, 
        preferences,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password -email');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add game to favorites
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { gameId } = req.params;
    
    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already in favorites
    if (user.favoriteGames.includes(gameId)) {
      return res.status(400).json({ message: 'Game already in favorites' });
    }
    
    user.favoriteGames.push(gameId);
    await user.save();
    
    res.json({ message: 'Game added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove game from favorites
export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { gameId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const gameIndex = user.favoriteGames.indexOf(gameId);
    if (gameIndex === -1) {
      return res.status(400).json({ message: 'Game not in favorites' });
    }
    
    user.favoriteGames.splice(gameIndex, 1);
    await user.save();
    
    res.json({ message: 'Game removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get nearby users
export const getNearbyUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { latitude, longitude, radius = 10 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Simple radius search (in a real app, you'd use geospatial queries)
    const users = await User.find({
      _id: { $ne: userId },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)]
          },
          $maxDistance: parseFloat(radius as string) * 1000 // Convert km to meters
        }
      }
    })
    .select('-password -email')
    .limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Error getting nearby users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    })
    .select('-password -email')
    .limit(parseInt(limit as string));
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
