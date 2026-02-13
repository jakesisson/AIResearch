import { Resume } from '../model';

/**
 * Domain interface for JSON resume exporters
 */
export interface IJsonResumeExporter<T> {
  /**
   * Export a JSON resume to another format
   * @param resume The JSON resume to export
   * @returns The exported output
   */
  export(resume: Resume): Promise<T>;
}

/**
 * HTML exporter interface
 */
export interface IHtmlExporter extends IJsonResumeExporter<string> {
  export(resume: Resume): Promise<string>;
}

/**
 * PDF exporter interface
 */
export interface IPdfExporter extends IJsonResumeExporter<Buffer> {
  /**
   * Export resume to PDF buffer
   * @param resume The JSON resume to export
   * @param options Optional PDF generation options
   */
  export(resume: Resume, options?: PdfOptions): Promise<Buffer>;
}

export interface PdfOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
}
