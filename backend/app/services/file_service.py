import os
import uuid
import whisper
import pytesseract
from PIL import Image
import openai
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile
from app.core.config import settings

class FileService:
    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
        
        # Initialize Whisper model
        self.whisper_model = whisper.load_model("base")
        
        # Set OpenAI API key
        if settings.openai_api_key:
            openai.api_key = settings.openai_api_key
    
    async def save_file(self, file: UploadFile, user_id: int) -> Tuple[str, str]:
        """Save uploaded file and return file path and filename"""
        # Create user directory
        user_dir = self.upload_dir / str(user_id)
        user_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = user_dir / unique_filename
        
        # Save file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        return str(file_path), file.filename
    
    def process_text_file(self, file_path: str) -> str:
        """Process text file and extract content"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content
        except UnicodeDecodeError:
            # Try with different encoding
            with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()
            return content
    
    def process_audio_file(self, file_path: str) -> str:
        """Process audio file using Whisper and return transcription"""
        try:
            result = self.whisper_model.transcribe(file_path)
            return result["text"]
        except Exception as e:
            raise Exception(f"Audio transcription failed: {str(e)}")
    
    def process_image_file(self, file_path: str) -> str:
        """Process image file using Tesseract OCR and return extracted text"""
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            raise Exception(f"Image text extraction failed: {str(e)}")
    
    def get_file_type(self, filename: str) -> str:
        """Determine file type based on extension"""
        extension = Path(filename).suffix.lower()
        
        text_extensions = ['.txt', '.md', '.doc', '.docx', '.pdf']
        audio_extensions = ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']
        
        if extension in text_extensions:
            return 'text'
        elif extension in audio_extensions:
            return 'audio'
        elif extension in image_extensions:
            return 'image'
        else:
            return 'unknown'
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from filesystem"""
        try:
            os.remove(file_path)
            return True
        except OSError:
            return False
