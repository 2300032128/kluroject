import uuid
from typing import List, Dict, Any

class ChunkingService:
    """
    Sliding window chunking service attaching rich metadata to each document chunk.
    """

    def create_chunks(
        self, 
        document_id: str,
        document_name: str,
        course_title: str,
        module_title: str,
        week_number: int,
        page_blocks: List[Dict[str, Any]],
        chunk_size_words: int = 120,
        overlap_words: int = 25
    ) -> List[Dict[str, Any]]:
        """
        Returns a list of chunk dicts:
        {
            "chunk_id": "...",
            "document_id": "...",
            "document_name": "...",
            "course": "...",
            "module": "...",
            "week": 6,
            "page_number": 1,
            "chunk_index": 0,
            "content": "..."
        }
        """
        chunks = []
        chunk_index = 0

        for block in page_blocks:
            page_num = block.get("page_number", 1)
            text = block.get("text", "")
            words = text.split()

            if not words:
                continue

            # Sliding window over words
            i = 0
            while i < len(words):
                chunk_words = words[i : i + chunk_size_words]
                chunk_text = " ".join(chunk_words)

                if chunk_text.strip():
                    chunk_id = str(uuid.uuid4())
                    chunks.append({
                        "chunk_id": chunk_id,
                        "document_id": document_id,
                        "document_name": document_name,
                        "course": course_title,
                        "module": module_title,
                        "week": week_number,
                        "page_number": page_num,
                        "chunk_index": chunk_index,
                        "content": chunk_text
                    })
                    chunk_index += 1

                i += (chunk_size_words - overlap_words)
                if i >= len(words) and i < len(words) + (chunk_size_words - overlap_words):
                    break

        return chunks

chunking_service = ChunkingService()
