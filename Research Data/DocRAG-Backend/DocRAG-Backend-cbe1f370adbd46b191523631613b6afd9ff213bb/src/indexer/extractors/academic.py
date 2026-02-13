import asyncio
from typing import List
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from crawl4ai import CrawlResult
from .base import BaseExtractor
import logging

logger = logging.getLogger(__name__)

class AcademicExtractor(BaseExtractor):
    def __init__(self):
        super().__init__()
        # Use faster model with optimized settings
        self.llm = create_chat_openai(
            model="gpt-4o-mini",
            temperature=0,
            max_retries=1,
        )
        
        # Optimize chunk settings
        self.chunk_size = 16000
        self.chunk_overlap = 200
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n## ", "\n# ", "\n", " ", ""],
            keep_separator=True
        )
        
        self.preprocess_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an academic paper preprocessing expert. Transform academic content into a clear, structured format.

PREPROCESSING REQUIREMENTS:

1. PAPER STRUCTURE
   - Abstract → Introduction → Methods → Results → Discussion → Conclusion
   - Add missing section headers where needed
   - Split run-on sections appropriately

2. TECHNICAL CONTENT
   - Format mathematical equations using proper markdown
   - Convert inline equations to $equation$ format
   - Convert block equations to $$equation$$ format
   - Preserve statistical notations and symbols

3. FIGURE & TABLE HANDLING
   - Convert figure captions to structured format:
     ```figure
     Caption: [caption text]
     Description: [detailed description]
     Key Findings: [main points from figure]
     ```
   - Format tables with proper markdown syntax
   - Include table headers and descriptions

4. CITATIONS & REFERENCES
   - Convert citations to consistent format [Author, Year]
   - Format reference list entries consistently
   - Preserve DOIs and links
   - Add section breaks between references

5. RESULTS PRESENTATION
   - Format statistical results consistently (p-values, test statistics)
   - Structure methodology steps clearly
   - Present experimental conditions in tables where appropriate
   - Format data ranges and uncertainties consistently

6. STANDARDIZATION
   - Convert all headers to markdown syntax
   - Add proper code block language identifiers
   - Format lists consistently
   - Preserve technical accuracy
   - Remove HTML formatting
   - Clean up whitespace

Transform the following academic content:"""),
            ("human", "{content}")
        ])

    async def extract(self, result: CrawlResult) -> List[Document]:
        try:
            content = result.markdown_v2.raw_markdown
            print(f"Processing academic document with {len(content)} characters...")
            
            chunks = self.text_splitter.split_text(content)
            print(f"Split into {len(chunks)} chunks for parallel processing")
            
            # Process all chunks in parallel batches
            batch_size = 10
            tasks = []
            
            for i in range(0, len(chunks), batch_size):
                batch = chunks[i:i + batch_size]
                task = self.llm.abatch([
                    self.preprocess_prompt.format(content=chunk)
                    for chunk in batch
                ])
                tasks.append(task)
                print(f"Queued batch {len(tasks)} for processing")
            
            print(f"Processing {len(tasks)} batches in parallel...")
            all_responses = await asyncio.gather(*tasks)
            
            preprocessed_chunks = [
                response.content 
                for batch_response in all_responses 
                for response in batch_response
            ]
            
            processed_content = "\n\n".join(preprocessed_chunks)
            print(f"Completed processing. Final length: {len(processed_content)}")
            
            return [Document(
                page_content=processed_content,
                metadata={
                    'url': result.url,
                    'type': 'academic_paper',
                    'original_size': len(content),
                    'processed_size': len(processed_content)
                }
            )]
            
        except Exception as e:
            logger.error(f"Error in extraction: {str(e)}", exc_info=True)
            return [] 