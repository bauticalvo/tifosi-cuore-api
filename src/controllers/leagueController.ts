import { Request, Response } from 'express';
import { League, Country, Media } from '../models';

export class LeagueController {
  static async getAllLeagues(req: Request, res: Response) {
    try {
      const { country, page = 1, limit = 50 } = req.query;

      const filter: any = {};
      if (country) filter.country = country;

      const leagues = await League.find(filter)
        .populate('image')
        .populate('country')
        .sort({ name: 1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await League.countDocuments(filter);

      res.json({
        success: true,
        data: leagues,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Get leagues error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching leagues',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getLeagueById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const league = await League.findById(id)
        .populate('image')
        .populate('country');

      if (!league) {
        return res.status(404).json({
          success: false,
          message: 'League not found'
        });
      }

      res.json({
        success: true,
        data: league
      });

    } catch (error) {
      console.error('Get league error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching league',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createLeague(req: Request, res: Response) {
    try {
      const leagueData = req.body;

      // Verificar que la imagen y país existan
      if (leagueData.image) {
        const imageExists = await Media.findById(leagueData.image);
        if (!imageExists) {
          return res.status(400).json({
            success: false,
            message: 'Image not found'
          });
        }
      }

      if (leagueData.country) {
        const countryExists = await Country.findById(leagueData.country);
        if (!countryExists) {
          return res.status(400).json({
            success: false,
            message: 'Country not found'
          });
        }
      }

      const league = await League.create(leagueData);
      const populatedLeague = await League.findById(league._id)
        .populate('image')
        .populate('country');

      res.status(201).json({
        success: true,
        message: 'League created successfully',
        data: populatedLeague
      });

    } catch (error) {
      console.error('Create league error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating league',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}