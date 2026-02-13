import JSZip from 'jszip';
import Papa from 'papaparse';

/**
 * Parser for LinkedIn export ZIP files in memory
 * Handles both Buffer (Node.js) and File (browser) inputs
 */
export class LinkedInZipParser {
  async parse(zipData: Buffer | File | ArrayBuffer): Promise<any> {
    try {
      const zip = new JSZip();
      let zipContents: JSZip;

      // Handle different input types
      if (zipData instanceof Buffer) {
        zipContents = await zip.loadAsync(zipData);
      } else if (zipData instanceof File) {
        const arrayBuffer = await zipData.arrayBuffer();
        zipContents = await zip.loadAsync(arrayBuffer);
      } else if (zipData instanceof ArrayBuffer) {
        zipContents = await zip.loadAsync(zipData);
      } else {
        throw new Error('Unsupported ZIP data type. Expected Buffer, File, or ArrayBuffer.');
      }

      // Extract and read relevant CSV files
      const profileCsv = await this.extractCsvFile(zipContents, 'Profile.csv');
      const positionsCsv = await this.extractCsvFile(zipContents, 'Positions.csv');
      const educationCsv = await this.extractCsvFile(zipContents, 'Education.csv');
      const skillsCsv = await this.extractCsvFile(zipContents, 'Skills.csv');

      // Parse CSVs
      const profile = Papa.parse(profileCsv, { header: true }).data;
      const positions = Papa.parse(positionsCsv, { header: true }).data;
      const education = Papa.parse(educationCsv, { header: true }).data;
      const skills = Papa.parse(skillsCsv, { header: true }).data;

      return { profile, positions, education, skills };
    } catch (error) {
      throw new Error(`Failed to parse LinkedIn export ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractCsvFile(zip: JSZip, filename: string): Promise<string> {
    const file = zip.file(filename);
    if (!file) {
      // Try to find the file in subdirectories
      const foundFile = Object.keys(zip.files).find(path => path.endsWith(filename));
      if (foundFile) {
        const foundFileObj = zip.file(foundFile);
        if (foundFileObj) {
          return await foundFileObj.async('text');
        }
      }
      throw new Error(`File ${filename} not found in LinkedIn export ZIP`);
    }
    return await file.async('text');
  }
}
