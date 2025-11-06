import { Request, Response } from 'express';
import { Color } from '../models';

export class ColorController {
  static async getAllColors(req: Request, res: Response) {
    try {
      const colors = await Color.find().sort({ name: 1 });

      res.json({
        success: true,
        data: colors
      });

    } catch (error) {
      console.error('Get colors error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching colors',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getColorById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const color = await Color.findById(id);

      if (!color) {
        return res.status(404).json({
          success: false,
          message: 'Color not found'
        });
      }

      res.json({
        success: true,
        data: color
      });

    } catch (error) {
      console.error('Get color error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching color',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createColor(req: Request, res: Response) {
    try {
      const colorData = req.body;

      const color = await Color.create(colorData);

      res.status(201).json({
        success: true,
        message: 'Color created successfully',
        data: color
      });

    } catch (error) {
      console.error('Create color error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating color',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateColor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const color = await Color.findByIdAndUpdate(id, updateData, { new: true });

      if (!color) {
        return res.status(404).json({
          success: false,
          message: 'Color not found'
        });
      }

      res.json({
        success: true,
        message: 'Color updated successfully',
        data: color
      });

    } catch (error) {
      console.error('Update color error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating color',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}