import { Response } from 'express';
import Match from '../models/Match';
import User from '../models/User';
import Game from '../models/Game';
import { AuthRequest, MatchSearchParams, CreateMatchData, UpdateMatchData, PaginatedResponse } from '../types';

// @desc    Get all matches
// @route   GET /api/matches
// @access  Public
export const getMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      game,
      latitude,
      longitude,
      maxDistance = 50,
      dateFrom,
      dateTo,
      maxPlayers,
      experience,
      tags,
      page = 1,
      limit = 20
    }: MatchSearchParams = req.query as any;

    let query: any = { status: { $in: ['open', 'full'] } };

    // Game filter
    if (game) {
      query.game = game;
    }

    // Location filter
    if (latitude && longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude.toString()), parseFloat(latitude.toString())]
          },
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.scheduledDate = {};
      if (dateFrom) query.scheduledDate.$gte = new Date(dateFrom);
      if (dateTo) query.scheduledDate.$lte = new Date(dateTo);
    }

    // Max players filter
    if (maxPlayers) {
      query.maxPlayers = { $lte: parseInt(maxPlayers.toString()) };
    }

    // Experience filter
    if (experience && experience !== 'any') {
      query['requirements.experience'] = experience;
    }

    // Tags filter
    if (tags) {
      const tagList = tags.split(',');
      query.tags = { $in: tagList };
    }

    const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

    const matches = await Match.find(query)
      .populate('host', 'username firstName lastName avatar')
      .populate('game', 'name images minPlayers maxPlayers playingTime complexity')
      .populate('currentPlayers.user', 'username firstName lastName avatar')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(parseInt(limit.toString()));

    const total = await Match.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        matches,
        pagination: {
          current: parseInt(page.toString()),
          pages: Math.ceil(total / parseInt(limit.toString())),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Get single match
// @route   GET /api/matches/:id
// @access  Public
export const getMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('host', 'username firstName lastName avatar location preferences')
      .populate('game', 'name description images minPlayers maxPlayers playingTime age categories mechanics complexity rating')
      .populate('currentPlayers.user', 'username firstName lastName avatar age bio preferences');

    if (!match) {
      res.status(404).json({
        status: 'error',
        message: 'Match not found'
      });
      return;
    }

    res.json({
      status: 'success',
      data: { match }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Create new match
// @route   POST /api/matches
// @access  Private
export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchData: CreateMatchData = req.body;
    
    // Add host to the match
    const match = await Match.create({
      ...matchData,
      host: req.user!._id,
      currentPlayers: [{
        user: req.user!._id,
        joinedAt: new Date(),
        status: 'confirmed'
      }]
    });

    // Populate the created match
    await match.populate([
      { path: 'host', select: 'username firstName lastName avatar' },
      { path: 'game', select: 'name images minPlayers maxPlayers playingTime complexity' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Match created successfully',
      data: { match }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during match creation',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Update match
// @route   PUT /api/matches/:id
// @access  Private
export const updateMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updateData: UpdateMatchData = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      res.status(404).json({
        status: 'error',
        message: 'Match not found'
      });
      return;
    }

    // Check if user is the host
    if (match.host.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        status: 'error',
        message: 'Only the host can update this match'
      });
      return;
    }

    // Don't allow updates if match is in progress or completed
    if (['in-progress', 'completed'].includes(match.status)) {
      res.status(400).json({
        status: 'error',
        message: 'Cannot update match that is in progress or completed'
      });
      return;
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'host', select: 'username firstName lastName avatar' },
      { path: 'game', select: 'name images minPlayers maxPlayers playingTime complexity' },
      { path: 'currentPlayers.user', select: 'username firstName lastName avatar' }
    ]);

    res.json({
      status: 'success',
      message: 'Match updated successfully',
      data: { match: updatedMatch }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during match update',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Join match
// @route   POST /api/matches/:id/join
// @access  Private
export const joinMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      res.status(404).json({
        status: 'error',
        message: 'Match not found'
      });
      return;
    }

    // Check if user is already in the match
    if (match.hasPlayer(req.user!._id)) {
      res.status(400).json({
        status: 'error',
        message: 'You are already in this match'
      });
      return;
    }

    // Check if match is full
    if (match.isFull) {
      res.status(400).json({
        status: 'error',
        message: 'Match is full'
      });
      return;
    }

    // Check if match is still open
    if (match.status !== 'open') {
      res.status(400).json({
        status: 'error',
        message: 'Match is not accepting new players'
      });
      return;
    }

    await match.addPlayer(req.user!._id);

    // Populate the updated match
    await match.populate([
      { path: 'host', select: 'username firstName lastName avatar' },
      { path: 'game', select: 'name images minPlayers maxPlayers playingTime complexity' },
      { path: 'currentPlayers.user', select: 'username firstName lastName avatar' }
    ]);

    res.json({
      status: 'success',
      message: 'Successfully joined the match',
      data: { match }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message || 'Server error during join',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Leave match
// @route   POST /api/matches/:id/leave
// @access  Private
export const leaveMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      res.status(404).json({
        status: 'error',
        message: 'Match not found'
      });
      return;
    }

    // Check if user is in the match
    if (!match.hasPlayer(req.user!._id)) {
      res.status(400).json({
        status: 'error',
        message: 'You are not in this match'
      });
      return;
    }

    // Host cannot leave their own match
    if (match.host.toString() === req.user!._id.toString()) {
      res.status(400).json({
        status: 'error',
        message: 'Host cannot leave their own match. Cancel the match instead.'
      });
      return;
    }

    await match.removePlayer(req.user!._id);

    // Populate the updated match
    await match.populate([
      { path: 'host', select: 'username firstName lastName avatar' },
      { path: 'game', select: 'name images minPlayers maxPlayers playingTime complexity' },
      { path: 'currentPlayers.user', select: 'username firstName lastName avatar' }
    ]);

    res.json({
      status: 'success',
      message: 'Successfully left the match',
      data: { match }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during leave',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Cancel match
// @route   DELETE /api/matches/:id
// @access  Private
export const cancelMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      res.status(404).json({
        status: 'error',
        message: 'Match not found'
      });
      return;
    }

    // Check if user is the host
    if (match.host.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        status: 'error',
        message: 'Only the host can cancel this match'
      });
      return;
    }

    // Don't allow cancellation if match is completed
    if (match.status === 'completed') {
      res.status(400).json({
        status: 'error',
        message: 'Cannot cancel completed match'
      });
      return;
    }

    match.status = 'cancelled';
    await match.save();

    res.json({
      status: 'success',
      message: 'Match cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during cancellation',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Get user's matches
// @route   GET /api/matches/my-matches
// @access  Private
export const getMyMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query: any = {
      $or: [
        { host: req.user!._id },
        { 'currentPlayers.user': req.user!._id }
      ]
    };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

    const matches = await Match.find(query)
      .populate('host', 'username firstName lastName avatar')
      .populate('game', 'name images minPlayers maxPlayers playingTime complexity')
      .populate('currentPlayers.user', 'username firstName lastName avatar')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(parseInt(limit.toString()));

    const total = await Match.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        matches,
        pagination: {
          current: parseInt(page.toString()),
          pages: Math.ceil(total / parseInt(limit.toString())),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};


