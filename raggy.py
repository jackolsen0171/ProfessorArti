#!/usr/bin/env python3
"""
Raggy - Universal ChromaDB RAG System v2.0.0
Personal RAG system for project knowledge management
"""

import os
import sys
import json
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Any
import re
import time
from datetime import datetime, timezone
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Check dependencies
def check_dependencies():
    required_packages = {
        'chromadb': 'chromadb',
        'sentence_transformers': 'sentence-transformers',
        'PyPDF2': 'PyPDF2',
        'docx': 'python-docx',
    }
    
    missing_packages = []
    for package, install_name in required_packages.items():
        try:
            __import__(package.replace('-', '_').replace('PyPDF2', 'PyPDF2'))
        except ImportError:
            missing_packages.append(install_name)
    
    if missing_packages:
        print(f"Missing packages: {', '.join(missing_packages)}")
        print(f"Install with: pip install {' '.join(missing_packages)}")
        return False
    return True

if not check_dependencies():
    sys.exit(1)

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None
try:
    from docx import Document
except ImportError:
    Document = None

class RaggyConfig:
    def __init__(self, config_path: str = ".raggy_config.json"):
        self.config_path = config_path
        self.default_config = {
            "docs_directory": "./docs",
            "chroma_db_path": "./.raggy_db", 
            "embedding_model": "all-MiniLM-L6-v2",
            "chunk_size": 800,
            "chunk_overlap": 100,
            "collection_name": "raggy_docs",
            "supported_extensions": [".md", ".txt", ".pdf", ".docx"],
            "exclude_patterns": ["*.tmp", "*.log", ".git/*", "node_modules/*", "__pycache__/*"],
            "hybrid_search": True,
            "keyword_weight": 0.3,
            "max_results": 10
        }
        self.config = self.load_config()
    
    def load_config(self) -> Dict:
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                return {**self.default_config, **config}
            except Exception as e:
                logger.warning(f"Error loading config: {e}. Using defaults.")
        return self.default_config.copy()
    
    def save_config(self):
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def get(self, key: str, default=None):
        return self.config.get(key, default)

class SmartChunker:
    def __init__(self, chunk_size: int = 800, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def chunk_text(self, text: str, metadata: Dict = None) -> List[Dict]:
        if not text.strip():
            return []
        
        # For markdown, try to preserve structure
        if metadata and metadata.get('file_extension') == '.md':
            return self._chunk_markdown(text, metadata)
        else:
            return self._chunk_generic(text, metadata)
    
    def _chunk_markdown(self, text: str, metadata: Dict) -> List[Dict]:
        """Markdown-aware chunking"""
        chunks = []
        lines = text.split('\n')
        current_chunk = ""
        current_headers = []
        
        for line in lines:
            # Check for headers
            if line.startswith('#'):
                level = len(line) - len(line.lstrip('#'))
                header_text = line.lstrip('#').strip()
                
                # Update header stack
                current_headers = current_headers[:level-1] + [header_text]
                
                # If current chunk is getting large, finalize it
                if len(current_chunk) > self.chunk_size * 0.7:
                    if current_chunk.strip():
                        chunks.append(self._create_chunk(current_chunk, metadata, current_headers[:-1], len(chunks)))
                    current_chunk = line + '\n'
                else:
                    current_chunk += line + '\n'
            else:
                current_chunk += line + '\n'
                
                # Check if chunk is full
                if len(current_chunk) > self.chunk_size:
                    chunks.append(self._create_chunk(current_chunk, metadata, current_headers, len(chunks)))
                    
                    # Start new chunk with some overlap
                    overlap_lines = current_chunk.split('\n')[-self.overlap//20:]
                    current_chunk = '\n'.join(overlap_lines)
        
        # Add final chunk
        if current_chunk.strip():
            chunks.append(self._create_chunk(current_chunk, metadata, current_headers, len(chunks)))
        
        return chunks
    
    def _chunk_generic(self, text: str, metadata: Dict) -> List[Dict]:
        """Generic text chunking"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            if end >= len(text):
                chunk_text = text[start:]
            else:
                # Try to find a good break point
                break_point = self._find_break_point(text, start + self.chunk_size - self.overlap, end)
                chunk_text = text[start:break_point]
            
            if chunk_text.strip():
                chunks.append(self._create_chunk(chunk_text, metadata, [], len(chunks)))
            
            start = end - self.overlap if end < len(text) else len(text)
        
        return chunks
    
    def _create_chunk(self, text: str, metadata: Dict, headers: List[str], chunk_idx: int) -> Dict:
        chunk_metadata = metadata.copy() if metadata else {}
        chunk_metadata.update({
            'chunk_id': chunk_idx,
            'char_count': len(text),
            'headers_context': ' > '.join(headers) if headers else '',
            'chunk_timestamp': datetime.now(timezone.utc).isoformat()
        })
        
        return {
            'text': text.strip(),
            'metadata': chunk_metadata
        }
    
    def _find_break_point(self, text: str, start: int, end: int) -> int:
        """Find optimal break point"""
        # Look for paragraph breaks
        for i in range(end, start, -1):
            if i < len(text) and text[i:i+2] == '\n\n':
                return i
        
        # Look for sentence endings
        for i in range(end, start, -1):
            if i < len(text) and text[i] in '.!?' and i+1 < len(text) and text[i+1] in ' \n':
                return i + 1
        
        # Look for word boundaries
        for i in range(end, start, -1):
            if i < len(text) and text[i] == ' ':
                return i
        
        return end

class DocumentProcessor:
    def __init__(self):
        self.processors = {
            '.md': self._process_text,
            '.txt': self._process_text,
        }
        if PyPDF2:
            self.processors['.pdf'] = self._process_pdf
        if Document:
            self.processors['.docx'] = self._process_docx
    
    def process_file(self, file_path: Path) -> Tuple[str, Dict]:
        ext = file_path.suffix.lower()
        
        if ext not in self.processors:
            raise ValueError(f"Unsupported file type: {ext}")
        
        try:
            text = self.processors[ext](file_path)
            metadata = {
                'file_path': str(file_path),
                'file_name': file_path.name,
                'file_extension': ext,
                'file_size': file_path.stat().st_size,
                'modified_time': datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
                'processed_time': datetime.now(timezone.utc).isoformat()
            }
            return text, metadata
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
            return "", {}
    
    def _process_text(self, file_path: Path) -> str:
        encodings = ['utf-8', 'utf-16', 'latin-1']
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
        raise ValueError(f"Could not decode {file_path}")
    
    def _process_pdf(self, file_path: Path) -> str:
        if not PyPDF2:
            raise ValueError("PyPDF2 not available")
        
        text = ""
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _process_docx(self, file_path: Path) -> str:
        if not Document:
            raise ValueError("python-docx not available")
        
        doc = Document(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])

class Raggy:
    def __init__(self, config_path: str = ".raggy_config.json"):
        self.config = RaggyConfig(config_path)
        self.client = None
        self.collection = None
        self.embedding_model = None
        self.chunker = SmartChunker(
            chunk_size=self.config.get('chunk_size'),
            overlap=self.config.get('chunk_overlap')
        )
        self.processor = DocumentProcessor()
        
        # Initialize if database exists
        db_path = self.config.get('chroma_db_path')
        if os.path.exists(db_path):
            self._init_client()
    
    def _init_client(self):
        try:
            self.client = chromadb.PersistentClient(
                path=self.config.get('chroma_db_path'),
                settings=Settings(anonymized_telemetry=False)
            )
            
            collection_name = self.config.get('collection_name')
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"description": f"Raggy collection: {collection_name}"}
            )
            
            # Load embedding model
            model_name = self.config.get('embedding_model')
            logger.info(f"Loading embedding model: {model_name}")
            self.embedding_model = SentenceTransformer(model_name)
            
        except Exception as e:
            logger.error(f"Error initializing client: {e}")
            raise
    
    def init_project(self):
        logger.info("Initializing Raggy project...")
        
        # Create docs directory
        docs_dir = Path(self.config.get('docs_directory'))
        docs_dir.mkdir(exist_ok=True)
        
        # Create example files if directory is empty
        if not any(docs_dir.iterdir()):
            example_files = {
                'README.md': '# Project Documentation\n\nThis directory contains project documentation for Raggy indexing.\n\n## Getting Started\n\nAdd your documentation files here and run `python raggy.py build` to index them.',
                'DEVELOPMENT.md': '# Development Notes\n\nTrack development decisions and progress here.',
                'API_REFERENCE.md': '# API Reference\n\nDocument your APIs and interfaces here.'
            }
            
            for filename, content in example_files.items():
                file_path = docs_dir / filename
                with open(file_path, 'w') as f:
                    f.write(content)
        
        # Initialize ChromaDB
        self._init_client()
        
        # Save configuration
        self.config.save_config()
        
        logger.info(f"✅ Raggy initialized!")
        logger.info(f"📁 Docs directory: {docs_dir}")
        logger.info(f"🗄️ Database: {self.config.get('chroma_db_path')}")
        logger.info(f"⚙️ Config: {self.config.config_path}")
    
    def build_index(self):
        if not self.client:
            self._init_client()
        
        docs_dir = Path(self.config.get('docs_directory'))
        if not docs_dir.exists():
            logger.error(f"Docs directory not found: {docs_dir}")
            return
        
        # Clear existing collection
        collection_name = self.config.get('collection_name')
        try:
            self.client.delete_collection(collection_name)
        except:
            pass
        
        self.collection = self.client.create_collection(
            name=collection_name,
            metadata={"description": f"Raggy collection: {collection_name}"}
        )
        
        # Process documents
        supported_exts = self.config.get('supported_extensions')
        exclude_patterns = self.config.get('exclude_patterns')
        
        file_count = 0
        chunk_count = 0
        
        logger.info("Indexing documents...")
        
        for file_path in docs_dir.rglob('*'):
            if not file_path.is_file() or file_path.suffix.lower() not in supported_exts:
                continue
            
            # Check exclude patterns
            if any(file_path.match(pattern) for pattern in exclude_patterns):
                continue
            
            logger.info(f"📄 {file_path.relative_to(docs_dir)}")
            
            try:
                text, metadata = self.processor.process_file(file_path)
                if not text.strip():
                    continue
                
                chunks = self.chunker.chunk_text(text, metadata)
                
                for chunk in chunks:
                    embedding = self.embedding_model.encode(chunk['text']).tolist()
                    
                    chunk_id = f"{file_path.stem}_{chunk['metadata']['chunk_id']}_{uuid.uuid4().hex[:8]}"
                    
                    self.collection.add(
                        documents=[chunk['text']],
                        embeddings=[embedding],
                        metadatas=[chunk['metadata']],
                        ids=[chunk_id]
                    )
                    chunk_count += 1
                
                file_count += 1
                
            except Exception as e:
                logger.error(f"Error processing {file_path}: {e}")
        
        logger.info(f"✅ Indexing complete!")
        logger.info(f"📄 Files: {file_count}")
        logger.info(f"🧩 Chunks: {chunk_count}")
    
    def search(self, query: str, n_results: int = None) -> List[Dict]:
        if not self.collection:
            logger.error("Collection not initialized. Run 'raggy.py build' first.")
            return []
        
        if n_results is None:
            n_results = self.config.get('max_results', 10)
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Perform search
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, 50),  # Limit to prevent huge results
                include=['documents', 'metadatas', 'distances']
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    metadata = results['metadatas'][0][i]
                    distance = results['distances'][0][i]
                    
                    formatted_results.append({
                        'document': doc,
                        'metadata': metadata,
                        'relevance_score': max(0, 1 - distance),  # Convert distance to score
                        'distance': distance
                    })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return []
    
    def interactive_search(self):
        if not self.collection:
            logger.error("Collection not initialized. Run 'raggy.py build' first.")
            return
        
        print("\n🔍 Raggy Interactive Search")
        print("Commands: 'help', 'status', 'quit'")
        print("Search options: '/n5 query' for 5 results")
        print("-" * 50)
        
        while True:
            try:
                query = input("\n🔎 > ").strip()
                
                if query.lower() in ['quit', 'exit', 'q']:
                    print("👋 Goodbye!")
                    break
                elif query.lower() == 'help':
                    self._print_help()
                    continue
                elif query.lower() == 'status':
                    self._print_status()
                    continue
                elif not query:
                    continue
                
                # Parse options
                n_results = self.config.get('max_results', 10)
                if query.startswith('/n'):
                    try:
                        parts = query.split(' ', 1)
                        n_results = int(parts[0][2:])
                        query = parts[1] if len(parts) > 1 else ""
                    except (ValueError, IndexError):
                        print("❌ Invalid format. Use: /n5 your query")
                        continue
                
                if not query:
                    print("❌ Please provide a search query")
                    continue
                
                # Search
                results = self.search(query, n_results)
                
                if not results:
                    print("❌ No results found")
                    continue
                
                # Display results
                print(f"\n📊 Found {len(results)} results for '{query}':")
                print("=" * 60)
                
                for i, result in enumerate(results, 1):
                    metadata = result['metadata']
                    score = result['relevance_score']
                    
                    print(f"\n[{i}] 📄 {metadata.get('file_name', 'Unknown')}")
                    print(f"    📈 Relevance: {score:.3f}")
                    
                    # Show headers for context
                    headers_context = metadata.get('headers_context', '')
                    if headers_context:
                        print(f"    📑 Context: {headers_context}")
                    
                    # Preview
                    doc_preview = result['document'][:300]
                    if len(result['document']) > 300:
                        doc_preview += "..."
                    print(f"    📝 {doc_preview}")
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
    
    def _print_help(self):
        print("""
🔍 Raggy Search Help

Commands:
  help     - Show this help
  status   - Database statistics  
  quit     - Exit

Search Options:
  /n5 query    - Return 5 results
  /n10 query   - Return 10 results

Examples:
  authentication patterns
  /n5 react hooks
  error handling strategies
        """)
    
    def _print_status(self):
        if not self.collection:
            print("❌ Database not initialized")
            return
        
        try:
            count = self.collection.count()
            print(f"\n📊 Raggy Status:")
            print(f"    📄 Documents: {count}")
            print(f"    🗄️ Collection: {self.config.get('collection_name')}")
            print(f"    📁 Docs: {self.config.get('docs_directory')}")
            print(f"    🤖 Model: {self.config.get('embedding_model')}")
            print(f"    📏 Chunk size: {self.config.get('chunk_size')}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def add_handoff_note(self, session_summary: str):
        """Add a handoff note for the next session"""
        if not self.collection:
            logger.error("Collection not initialized")
            return
        
        timestamp = datetime.now(timezone.utc).isoformat()
        handoff_doc = f"""# Development Session Handoff - {timestamp}

## What we worked on:
{session_summary}

## Status:
- Session completed: {timestamp}
- Ready for next developer

## Next Steps:
See DEVELOPMENT_STATE.md for current priorities and context.
"""
        
        try:
            embedding = self.embedding_model.encode(handoff_doc).tolist()
            
            self.collection.add(
                documents=[handoff_doc],
                embeddings=[embedding],
                metadatas=[{
                    'file_name': f'handoff_{timestamp}',
                    'file_extension': '.md',
                    'doc_type': 'handoff',
                    'timestamp': timestamp,
                    'chunk_id': 0
                }],
                ids=[f"handoff_{uuid.uuid4().hex[:8]}"]
            )
            
            logger.info("✅ Handoff note added to RAG")
            
        except Exception as e:
            logger.error(f"Error adding handoff: {e}")

def main():
    parser = argparse.ArgumentParser(description='Raggy - Personal RAG System')
    parser.add_argument('command', 
                       choices=['init', 'build', 'search', 'interactive', 'status'],
                       help='Command to execute')
    parser.add_argument('query', nargs='?', help='Search query')
    parser.add_argument('--results', '-n', type=int, default=None, 
                       help='Number of results')
    parser.add_argument('--config', default='.raggy_config.json',
                       help='Config file path')
    
    args = parser.parse_args()
    
    try:
        raggy = Raggy(args.config)
        
        if args.command == 'init':
            raggy.init_project()
            
        elif args.command == 'build':
            raggy.build_index()
            
        elif args.command == 'search':
            if not args.query:
                print("❌ Search query required")
                sys.exit(1)
            
            results = raggy.search(args.query, args.results)
            
            if not results:
                print("❌ No results found")
                return
            
            print(f"\n🔍 Results for '{args.query}':")
            print("=" * 50)
            
            for i, result in enumerate(results, 1):
                metadata = result['metadata']
                score = result['relevance_score']
                
                print(f"\n[{i}] 📄 {metadata.get('file_name', 'Unknown')}")
                print(f"    📈 Relevance: {score:.3f}")
                
                # Context
                headers_context = metadata.get('headers_context', '')
                if headers_context:
                    print(f"    📑 {headers_context}")
                
                # Preview
                doc_preview = result['document'][:200]
                if len(result['document']) > 200:
                    doc_preview += "..."
                print(f"    📝 {doc_preview}")
            
        elif args.command == 'interactive':
            raggy.interactive_search()
            
        elif args.command == 'status':
            raggy._print_status()
    
    except Exception as e:
        logger.error(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()