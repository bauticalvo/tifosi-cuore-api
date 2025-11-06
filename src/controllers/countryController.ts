import { Request, Response } from 'express';
import { Country, Media } from '../models';

export class CountryController {
  static async getAllCountries(req: Request, res: Response) {
    try {
      const countries = await Country.find()
        .populate('image')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: countries
      });

    } catch (error) {
      console.error('Get countries error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching countries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCountryById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const country = await Country.findById(id).populate('image');

      if (!country) {
        return res.status(404).json({
          success: false,
          message: 'Country not found'
        });
      }

      res.json({
        success: true,
        data: country
      });

    } catch (error) {
      console.error('Get country error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching country',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createCountry(req: Request, res: Response) {
    try {
      const countryData = req.body;

      // Verificar que la imagen exista
      if (countryData.image) {
        const imageExists = await Media.findById(countryData.image);
        if (!imageExists) {
          return res.status(400).json({
            success: false,
            message: 'Image not found'
          });
        }
      }

      const country = await Country.create(countryData);
      const populatedCountry = await Country.findById(country._id).populate('image');

      res.status(201).json({
        success: true,
        message: 'Country created successfully',
        data: populatedCountry
      });

    } catch (error) {
      console.error('Create country error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating country',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}