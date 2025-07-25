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

try:
    import magic
    HAS_MAGIC = True
except ImportError:
    HAS_MAGIC = False

class FileService:
    _whisper_model = None

    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
        
        # Initialize Whisper model only once per process
        if whisper is None:
            raise ImportError("The 'whisper' package is required for audio processing. Please install it.")
        if FileService._whisper_model is None:
            FileService._whisper_model = whisper.load_model("base")
        self.whisper_model = FileService._whisper_model
        
        # Set OpenAI API key
        if openai is None:
            raise ImportError("The 'openai' package is required for OpenAI integration. Please install it.")
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
        if whisper is None:
            raise ImportError("The 'whisper' package is required for audio processing. Please install it.")
        try:
            result = self.whisper_model.transcribe(file_path)
            return result["text"]
        except Exception as e:
            raise Exception(f"Audio transcription failed: {str(e)}")
    
    def process_image_file(self, file_path: str) -> str:
        """Process image file using Tesseract OCR and return extracted text"""
        if pytesseract is None or Image is None:
            raise ImportError("The 'pytesseract' and 'Pillow' packages are required for image processing. Please install them.")
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            raise Exception(f"Image text extraction failed: {str(e)}")
    
    def get_file_type(self, filename: str, file_content: Optional[bytes] = None) -> str:
        """Determine file type based on content (if available) or extension"""
        extension = Path(filename).suffix.lower()
        
        text_extensions = ['.txt', '.md', '.doc', '.docx', '.pdf']
        audio_extensions = ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']
        
        # Try content-based detection if possible
        if HAS_MAGIC and file_content:
            import magic
            mime = magic.from_buffer(file_content, mime=True)
            if mime.startswith('text/'):
                return 'text'
            elif mime.startswith('audio/'):
                return 'audio'
            elif mime.startswith('image/'):
                return 'image'
            else:
                return 'unknown'
        # Fallback to extension
        if extension in text_extensions:
            return 'text'
        elif extension in audio_extensions:
            return 'audio'
        elif extension in image_extensions:
            return 'image'
        else:
            return 'unknown'
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from filesystem (synchronous)"""
        try:
            os.remove(file_path)
            return True
        except OSError:
            return False

    async def async_delete_file(self, file_path: str) -> bool:
        """Delete file from filesystem asynchronously (for large files)"""
        try:
            try:
                import aiofiles.os
                await aiofiles.os.remove(file_path)
            except ImportError:
                # Fallback to sync if aiofiles is not available
                os.remove(file_path)
            return True
        except OSError:
            return False
