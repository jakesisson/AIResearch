export interface JobOffer {
  url: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location?: string;
  salary?: string;
  scrapedAt: Date;
}

export interface JobOfferScrapingResult {
  success: boolean;
  jobOffer?: JobOffer;
  error?: string;
  rawHtml?: string;
} 