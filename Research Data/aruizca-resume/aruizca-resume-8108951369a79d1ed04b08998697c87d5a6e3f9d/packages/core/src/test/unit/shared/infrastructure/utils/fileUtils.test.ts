import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readdir } from 'fs/promises';
import { findLatestHtmlFile } from '../../../../../main/shared';
// Mock fs/promises
vi.mock('fs/promises', () => ({
  readdir: vi.fn()
}));

describe('findLatestHtmlFile', () => {
  const mockReaddir = readdir as any;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return the latest HTML file based on date in filename', async () => {
    // Mock file list with different dates
    const mockFiles = [
      'resume-20250805.html',  // Aug 5, 2025
      'resume-20250806.html',  // Aug 6, 2025 (latest)
      'resume-20250714.html',  // Jul 14, 2025
      'other-file.txt',        // Non-HTML file
      'resume-20250806.json'   // Non-HTML resume file
    ];
    
    mockReaddir.mockResolvedValue(mockFiles);
    
    const result = await findLatestHtmlFile();
    
    // Check that the function found the correct latest file
    expect(result).toContain('resume-20250806.html');
    expect(result).toMatch(/resume-20250806\.html$/);
  });

  it('should handle files with different date formats correctly', async () => {
    const mockFiles = [
      'resume-20250806.html',  // Aug 6, 2025
      'resume-20250805.html',  // Aug 5, 2025
      'resume-20241231.html',  // Dec 31, 2024
      'resume-20250101.html'   // Jan 1, 2025
    ];
    
    mockReaddir.mockResolvedValue(mockFiles);
    
    const result = await findLatestHtmlFile();
    
    expect(result).toContain('resume-20250806.html');
  });

  it('should throw error when no HTML files found', async () => {
    const mockFiles = [
      'other-file.txt',
      'resume-20250806.json',
      'document.pdf'
    ];
    
    mockReaddir.mockResolvedValue(mockFiles);
    
    await expect(findLatestHtmlFile()).rejects.toThrow('No HTML files found in output directory');
  });

  it('should handle files with invalid date formats gracefully', async () => {
    const mockFiles = [
      'resume-20250806.html',  // Valid date
      'resume-invalid.html',   // Invalid date
      'resume-20250805.html'   // Valid date
    ];
    
    mockReaddir.mockResolvedValue(mockFiles);
    
    const result = await findLatestHtmlFile();
    
    // Should still return the latest valid date
    expect(result).toContain('resume-20250806.html');
  });

  it('should sort correctly when dates are in different years', async () => {
    const mockFiles = [
      'resume-20231231.html',  // Dec 31, 2023
      'resume-20250101.html',  // Jan 1, 2025
      'resume-20241231.html'   // Dec 31, 2024
    ];
    
    mockReaddir.mockResolvedValue(mockFiles);
    
    const result = await findLatestHtmlFile();
    
    expect(result).toContain('resume-20250101.html');
  });
}); 