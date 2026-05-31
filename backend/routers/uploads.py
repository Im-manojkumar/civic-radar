from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import base64
from backend.security.jwt import get_current_active_user

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_active_user)
):
    """
    Accepts an image upload and returns a Base64 data URI.
    In a production system, this would upload to S3 or Supabase Storage and return a public URL.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
        
    encoded = base64.b64encode(contents).decode("utf-8")
    data_uri = f"data:{file.content_type};base64,{encoded}"
    
    return {"photo_url": data_uri}
