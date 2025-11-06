import { Request, Response } from 'express';
import { Team, League, Media } from '../models';

export class TeamController {
  static async getAllTeams(req: Request, res: Response) {
    try {
      const { league, page = 1, limit = 50 } = req.query;

      const filter: any = {};
      if (league) filter.league = league;

      const teams = await Team.find(filter)
        .populate('image')
        .populate('league')
        .sort({ name: 1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Team.countDocuments(filter);

      res.json({
        success: true,
        data: teams,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching teams',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getTeamById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const team = await Team.findById(id)
        .populate('image')
        .populate('league');

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      res.json({
        success: true,
        data: team
      });

    } catch (error) {
      console.error('Get team error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching team',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createTeam(req: Request, res: Response) {
    try {
      const teamData = req.body;

      // Verificar que la imagen y liga existan
      if (teamData.image) {
        const imageExists = await Media.findById(teamData.image);
        if (!imageExists) {
          return res.status(400).json({
            success: false,
            message: 'Image not found'
          });
        }
      }

      if (teamData.league) {
        const leagueExists = await League.findById(teamData.league);
        if (!leagueExists) {
          return res.status(400).json({
            success: false,
            message: 'League not found'
          });
        }
      }

      const team = await Team.create(teamData);
      const populatedTeam = await Team.findById(team._id)
        .populate('image')
        .populate('league');

      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: populatedTeam
      });

    } catch (error) {
      console.error('Create team error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating team',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateTeam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const team = await Team.findByIdAndUpdate(id, updateData, { new: true })
        .populate('image')
        .populate('league');

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      res.json({
        success: true,
        message: 'Team updated successfully',
        data: team
      });

    } catch (error) {
      console.error('Update team error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating team',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteTeam(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const team = await Team.findByIdAndDelete(id);

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      res.json({
        success: true,
        message: 'Team deleted successfully'
      });

    } catch (error) {
      console.error('Delete team error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting team',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}