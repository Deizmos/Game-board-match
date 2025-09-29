import { Response } from 'express';
import Game from '../models/Game';
import { AuthRequest, GameSearchParams, CreateGameData, UpdateGameData, RateGameData, PaginatedResponse } from '../types';

// @desc    Get all games
// @route   GET /api/games
// @access  Public
export const getGames = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      categories,
      mechanics,
      minPlayers,
      maxPlayers,
      complexity,
      minRating,
      sortBy = 'popularity',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    }: GameSearchParams = req.query as any;

    let query: any = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Categories filter
    if (categories) {
      const categoryList = categories.split(',');
      query.categories = { $in: categoryList };
    }

    // Mechanics filter
    if (mechanics) {
      const mechanicList = mechanics.split(',');
      query.mechanics = { $in: mechanicList };
    }

    // Player count filter
    if (minPlayers || maxPlayers) {
      query.$and = [];
      if (minPlayers) {
        query.$and.push({ maxPlayers: { $gte: parseInt(minPlayers.toString()) } });
      }
      if (maxPlayers) {
        query.$and.push({ minPlayers: { $lte: parseInt(maxPlayers.toString()) } });
      }
    }

    // Complexity filter
    if (complexity) {
      query.complexity = parseInt(complexity.toString());
    }

    // Rating filter
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating.toString()) };
    }

    // Sort options
    let sort: any = {};
    switch (sortBy) {
      case 'name':
        sort.name = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'rating':
        sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'year':
        sort.yearPublished = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'complexity':
        sort.complexity = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sort.popularity = sortOrder === 'desc' ? -1 : 1;
    }

    const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

    const games = await Game.find(query)
      .select('name description minPlayers maxPlayers playingTime age categories mechanics complexity rating images publisher yearPublished')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit.toString()));

    const total = await Game.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        games,
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

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Public
export const getGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      res.status(404).json({
        status: 'error',
        message: 'Game not found'
      });
      return;
    }

    res.json({
      status: 'success',
      data: { game }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Create new game
// @route   POST /api/games
// @access  Private
export const createGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gameData: CreateGameData = req.body;
    const game = await Game.create(gameData);

    res.status(201).json({
      status: 'success',
      message: 'Game created successfully',
      data: { game }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during game creation',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Update game
// @route   PUT /api/games/:id
// @access  Private
export const updateGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updateData: UpdateGameData = req.body;
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!game) {
      res.status(404).json({
        status: 'error',
        message: 'Game not found'
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Game updated successfully',
      data: { game }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during game update',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Rate game
// @route   POST /api/games/:id/rate
// @access  Private
export const rateGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating }: RateGameData = req.body;

    if (rating < 1 || rating > 10) {
      res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 10'
      });
      return;
    }

    const game = await Game.findById(req.params.id);

    if (!game) {
      res.status(404).json({
        status: 'error',
        message: 'Game not found'
      });
      return;
    }

    await game.updateRating(rating);

    res.json({
      status: 'success',
      message: 'Game rated successfully',
      data: {
        rating: game.rating.average,
        count: game.rating.count
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during rating',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Get popular games
// @route   GET /api/games/popular
// @access  Public
export const getPopularGames = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const games = await Game.find({ isActive: true })
      .select('name images rating.average popularity')
      .sort({ popularity: -1 })
      .limit(parseInt(limit.toString()));

    res.json({
      status: 'success',
      data: { games }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Get game categories
// @route   GET /api/games/categories
// @access  Public
export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Game.distinct('categories', { isActive: true });
    
    res.json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Get game mechanics
// @route   GET /api/games/mechanics
// @access  Public
export const getMechanics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mechanics = await Game.distinct('mechanics', { isActive: true });
    
    res.json({
      status: 'success',
      data: { mechanics }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};


