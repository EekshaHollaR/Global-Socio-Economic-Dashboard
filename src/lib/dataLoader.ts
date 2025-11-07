import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { FoodDataRow, CountryData } from "@/types/data";

export class DataLoader {
  private static economicDataCache: any[] | null = null;
  private static foodDataCache: FoodDataRow[] | null = null;

  // Load Economic Data from CSV
  static async loadEconomicData(): Promise<any[]> {
    if (this.economicDataCache) return this.economicDataCache;

    try {
      const response = await fetch("/data/economic_dataset.csv");
      const text = await response.text();
      
      return new Promise((resolve) => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            this.economicDataCache = results.data;
            resolve(results.data);
          },
        });
      });
    } catch (error) {
      console.error("Error loading economic data:", error);
      return [];
    }
  }

  // Load Food Data from Excel (new dataset)
  static async loadFoodData(): Promise<FoodDataRow[]> {
    if (this.foodDataCache) return this.foodDataCache;

    try {
      const response = await fetch("/data/food_dataset_new.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      this.foodDataCache = data.map((row: any) => ({
        countryName: row["Country Name"],
        countryCode: row["Country Code"],
        year: row["Year"],
        cerealYield: row["Cereal yield (kg per hectare)"],
        foodImports: row["Food imports (% of merchandise imports)"],
        foodProductionIndex: row["Food production index (2014-2016 = 100)"],
        gdpCurrent: row["GDP (current US$)"],
        gdpGrowth: row["GDP growth (annual %)"],
        gdpPerCapita: row["GDP per capita (current US$)"],
        inflation: row["Inflation, consumer prices (annual %)"],
        populationGrowth: row["Population growth (annual %)"],
      }));

      return this.foodDataCache;
    } catch (error) {
      console.error("Error loading food data:", error);
      return [];
    }
  }

  // Get combined data (merge economic and food data)
  static async getCombinedData(): Promise<any[]> {
    const [economic, food] = await Promise.all([
      this.loadEconomicData(),
      this.loadFoodData(),
    ]);

    // Create a map for quick lookup
    const foodMap = new Map();
    food.forEach((row) => {
      const key = `${row.countryName}-${row.year}`;
      foodMap.set(key, row);
    });

    // Merge datasets
    return economic.map((eRow: any) => {
      const key = `${eRow["Country Name"]}-${eRow["Date"]}`;
      const fRow = foodMap.get(key) || {};
      
      return {
        countryName: eRow["Country Name"],
        year: eRow["Date"],
        // Economic indicators
        domesticCredit: eRow["Domestic credit to private sector (% of GDP)"],
        exports: eRow["Exports of goods and services (% of GDP)"],
        gdpGrowth: eRow["GDP growth (annual %)"],
        gdpPerCapita: eRow["GDP per capita (current US$)"],
        grossCapital: eRow["Gross fixed capital formation (% of GDP)"],
        imports: eRow["Imports of goods and services (% of GDP)"],
        inflation: eRow["Inflation, consumer prices (annual %)"],
        unemployment: eRow["Unemployment, total (% of total labor force) (modeled ILO estimate)"],
        // Food indicators
        cerealYield: fRow.cerealYield,
        foodImports: fRow.foodImports,
        foodProductionIndex: fRow.foodProductionIndex,
        populationGrowth: fRow.populationGrowth,
      };
    }).filter((row: any) => row.countryName);
  }

  // Get list of unique countries
  static async getCountries(): Promise<string[]> {
    const data = await this.loadEconomicData();
    const countries = [...new Set(data.map((row: any) => row["Country Name"]))];
    return countries.filter(Boolean).sort();
  }

  // Get country-specific data
  static async getCountryData(countryName: string): Promise<CountryData | null> {
    try {
      const combinedData = await this.getCombinedData();
      const countryData = combinedData.filter((row: any) => row.countryName === countryName);

      if (countryData.length === 0) return null;

      // Get latest data
      const latestData = countryData[countryData.length - 1];

      return {
        countryName,
        latestData,
        historicalFood: countryData,
        historicalIndicators: countryData,
      };
    } catch (error) {
      console.error(`Error loading data for ${countryName}:`, error);
      return null;
    }
  }

  // Get year range
  static async getYearRange(): Promise<{ min: number; max: number }> {
    const data = await this.loadEconomicData();
    const years = data.map((row: any) => row["Date"]).filter(Boolean);
    return {
      min: Math.min(...years),
      max: Math.max(...years),
    };
  }
}
