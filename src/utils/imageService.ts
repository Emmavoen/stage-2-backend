import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import Country from "../modules/country/country.model"; // Assuming this path is correct

// Ensure the cache directory exists
const CACHE_DIR = path.join(__dirname, "..", "..", "cache");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Publicly export the path for the controller to use
export const IMAGE_PATH = path.join(CACHE_DIR, "summary.png");

export async function generateSummaryImage(
  totalCountries: number,
  refreshTime: Date
): Promise<void> {
  try {
    // 1. Fetch top 5 countries by GDP
    const topCountries = await Country.findAll({
      order: [["estimated_gdp", "DESC"]],
      limit: 5,
      attributes: ["name", "estimated_gdp"],
    });

    // 2. Create SVG content for the image
    let listItems = "";
    for (const country of topCountries) {
      const gdp = country.estimated_gdp
        ? country.estimated_gdp.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        : "N/A";
      // Add a new <text> element for each country
      listItems += `
        <text x="30" y="${
          190 + topCountries.indexOf(country) * 25
        }" class="list-item">
          - ${country.name}: $${gdp}
        </text>
      `;
    }

    const svgContent = `
      <svg width="500" height="350" xmlns="http://www.w3.org/2000/svg">
        <style>
          .bg { fill: #F0F4F8; }
          .title { font: bold 24px Arial, sans-serif; fill: #102A43; }
          .info { font: 18px Arial, sans-serif; fill: #102A43; }
          .sub-title { font: bold 20px Arial, sans-serif; fill: #102A43; }
          .list-item { font: 16px Arial, sans-serif; fill: #102A43; }
        </style>
        
        <rect width="100%" height="100%" class="bg" />
        
        <text x="20" y="40" class="title">Country Data Summary</text>
        <text x="20" y="80" class="info">Total Countries: ${totalCountries}</text>
        <text x="20" y="110" class="info">Last Refresh: ${refreshTime.toUTCString()}</text>
        
        <text x="20" y="160" class="sub-title">Top 5 Countries by Estimated GDP</text>
        ${listItems}
      </svg>
    `;

    // 3. Use sharp to render the SVG into a PNG file
    await sharp(Buffer.from(svgContent)).png().toFile(IMAGE_PATH);

    console.log(`Summary image generated successfully at ${IMAGE_PATH}`);
  } catch (error) {
    console.error("Failed to generate summary image with sharp:", error);
  }
}
