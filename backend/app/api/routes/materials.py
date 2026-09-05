from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Document, DocumentChunk, Course, Module
from app.services.ingestion import ingestion_service
from app.services.chunking import chunking_service
from typing import List

router = APIRouter(prefix="/instructor/materials", tags=["materials"])

@router.get("")
def list_materials(course_id: str = "course_thermo", db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.course_id == course_id).all()
    results = []
    for d in docs:
        course = db.query(Course).filter(Course.id == d.course_id).first()
        mod = db.query(Module).filter(Module.id == d.module_id).first() if d.module_id else None
        
        results.append({
            "id": d.id,
            "document_name": d.title,
            "course": course.title if course else "Thermodynamics",
            "module": mod.title if mod else "Week 6 - Entropy",
            "pages_count": len(d.chunks) if d.chunks else 1,
            "chunks_count": len(d.chunks),
            "processing_status": "Processed",
            "uploaded_at": d.created_at
        })
    return results

@router.post("/upload")
async def upload_material(
    title: str = Form(...),
    course_id: str = Form("course_thermo"),
    module_id: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    
    # 1. Text Extraction
    page_blocks = ingestion_service.extract_document(file.filename, file_bytes)
    full_text = "\n\n".join([b["text"] for b in page_blocks])

    # 2. Fetch Course & Module names for Metadata
    course = db.query(Course).filter(Course.id == course_id).first()
    course_title = course.title if course else "Thermodynamics"
    
    mod = db.query(Module).filter(Module.id == module_id).first() if module_id else None
    module_title = mod.title if mod else "Week 6 - Entropy"
    week_num = mod.week_number if mod else 6

    # 3. Create Document Record
    doc = Document(
        course_id=course_id,
        module_id=module_id or (mod.id if mod else None),
        title=title,
        file_type=file.filename.split(".")[-1] if "." in file.filename else "pdf",
        content_text=full_text
    )
    db.add(doc)
    db.commit()

    # 4. Create Chunks with Metadata
    chunks_data = chunking_service.create_chunks(
        document_id=doc.id,
        document_name=title,
        course_title=course_title,
        module_title=module_title,
        week_number=week_num,
        page_blocks=page_blocks
    )

    # 5. Persist Chunks to DB
    for idx, c_data in enumerate(chunks_data):
        chunk_obj = DocumentChunk(
            document_id=doc.id,
            chunk_index=idx,
            page_number=c_data["page_number"],
            content=c_data["content"]
        )
        db.add(chunk_obj)
    
    db.commit()

    return {
        "status": "success",
        "document_id": doc.id,
        "document_name": title,
        "course": course_title,
        "module": module_title,
        "pages_count": len(page_blocks),
        "chunks_count": len(chunks_data),
        "processing_status": "Processed",
        "message": f"Successfully ingested and indexed '{title}' into {len(chunks_data)} metadata-tagged vector chunks!"
    }
