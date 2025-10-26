import type { Request, Response, NextFunction } from "express";
import { CountryService } from "./country.service";
import { Op, type FindOptions, type OrderItem } from "sequelize";
import Country from "./country.model";
import AppStatus from "../app-status/app-status.model";
import * as fs from "fs";
import { IMAGE_PATH } from "../../utils/imageService"; // <-- ADDED THIS IMPORT
import type { GetCountriesQuery } from "./country.interface";

export class countryController {
  // POST /api/countries/refresh
  static refreshCountries = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { total, time } = await CountryService.refreshCountries();
      res.status(200).json({
        message: "Cache refreshed successfully",
        total_countries: total,
        last_refreshed_at: time,
      });
    } catch (error) {
      next(error); // Pass to the global error handler
    }
  };

  // GET /api/countries
  static getAllCountries = async (
    req: Request<{}, {}, {}, GetCountriesQuery>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { region, currency, sort } = req.query;

      const options: FindOptions = {
        where: {},
        // order: [] as OrderItem[], // <-- REMOVED
      };

      // --- FIX: Create the order array separately ---
      const orderItems: OrderItem[] = [];

      // Apply filters
      if (region) {
        (options.where as any).region = { [Op.like]: region };
      }
      if (currency) {
        (options.where as any).currency_code = { [Op.like]: currency };
      }

      // Apply sorting to the new array
      if (sort === "gdp_desc") {
        orderItems.push(["estimated_gdp", "DESC"]);
      } else {
        orderItems.push(["name", "ASC"]); // Default sort by name ASC
      }

      // --- FIX: Assign the completed array to options.order ---
      options.order = orderItems;

      const countries = await Country.findAll(options);
      res.status(200).json(countries);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/countries/:name
  static getCountryByName = async (
    req: Request<{ name: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name } = req.params;
      const country = await Country.findOne({
        where: { name: { [Op.like]: name } }, // Case-insensitive search
      });

      if (!country) {
        // As per spec
        return res.status(404).json({ error: "Country not found" });
      }
      res.status(200).json(country);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/countries/:name
  static deleteCountryByName = async (
    req: Request<{ name: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name } = req.params;
      const result = await Country.destroy({
        where: { name: { [Op.like]: name } },
      });

      if (result === 0) {
        return res.status(404).json({ error: "Country not found" });
      }
      res.status(204).send(); // 204 No Content for successful DELETE
    } catch (error) {
      next(error);
    }
  };

  // GET /api/status
  static getStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const status = await AppStatus.findByPk(1);
      if (!status) {
        // If /refresh has never been run
        return res.status(200).json({
          total_countries: 0,
          last_refreshed_at: null,
        });
      }
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/countries/image
  static getSummaryImage = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (fs.existsSync(IMAGE_PATH)) {
        // This will now work
        res.sendFile(IMAGE_PATH);
      } else {
        // As per spec
        res.status(404).json({ error: "Summary image not found" });
      }
    } catch (error) {
      next(error);
    }
  };
}
