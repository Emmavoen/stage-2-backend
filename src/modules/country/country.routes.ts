import { Router } from "express";
import { countryController } from "./country.controller";

const countryRouter = Router();
countryRouter.route("/").get(countryController.getAllCountries);
countryRouter.route("/refresh").post(countryController.refreshCountries);
countryRouter.route("/image").get(countryController.getSummaryImage);
countryRouter.route("/status").get(countryController.getStatus);

countryRouter.route("/:name").get(countryController.getCountryByName);
countryRouter.route("/:name").delete(countryController.deleteCountryByName);

export default countryRouter;
