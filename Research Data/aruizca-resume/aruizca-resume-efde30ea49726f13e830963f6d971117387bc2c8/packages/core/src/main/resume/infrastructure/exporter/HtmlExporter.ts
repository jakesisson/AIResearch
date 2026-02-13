import { Resume } from '../../domain';
import { IHtmlExporter } from '../../domain/services/IJsonResumeExporter';
import * as theme from 'jsonresume-theme-even';

/**
 * HTML exporter that exports JSON Resume to HTML format
 */
export class HtmlExporter implements IHtmlExporter {
  /**
   * Export a JSON resume to HTML
   * @param resume The JSON resume to export
   * @returns HTML string
   */
  async export(resume: Resume): Promise<string> {
    // Use the jsonresume-theme-even package to render HTML
    return theme.render(resume as any);
  }
}
