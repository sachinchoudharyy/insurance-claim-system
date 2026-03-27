# from fastapi import APIRouter, UploadFile, File, Form
# from app.db.supabase_client import supabase
# import uuid

# router = APIRouter()


# @router.post("/upload-video")
# async def upload_video(
#     interview_id: str = Form(...),
#     case_id: str = Form(...),
#     file: UploadFile = File(...)
# ):

#     data = await file.read()

#     name = f"{uuid.uuid4()}.webm"

#     path = f"{case_id}/{interview_id}/{name}"

#     supabase.storage.from_("interview-videos")\
#         .upload(path, data, {"content-type": "video/webm"})

#     url = supabase.storage.from_("interview-videos")\
#         .get_public_url(path)

#     supabase.table("videos").insert({
#         "interview_id": interview_id,
#         "case_id": case_id,
#         "video_url": url
#     }).execute()

#     return {"url": url}


# @router.get("/videos/{case_id}")
# def get_videos(case_id: str):

#     result = supabase.table("videos") \
#         .select("*") \
#         .eq("case_id", case_id) \
#         .execute()

#     return result.data

from fastapi import APIRouter, UploadFile, File, Form
from app.db.supabase_client import supabase
import uuid

router = APIRouter()


@router.post("/upload-video")
async def upload_video(
    interview_id: str = Form(...),
    case_id: str = Form(...),   # this is USER INPUT like TEST-001
    file: UploadFile = File(...)
):

    # read video file
    data = await file.read()

    # generate unique filename
    name = f"{uuid.uuid4()}.webm"

    # path uses user case_id (for readable storage structure)
    path = f"{case_id}/{interview_id}/{name}"

    # upload to Supabase storage
    supabase.storage.from_("interview-videos") \
        .upload(path, data, {"content-type": "video/webm"})

    # get public URL
    url = supabase.storage.from_("interview-videos") \
        .get_public_url(path)

    # 🔥 IMPORTANT: convert case_id (TEST-001) → UUID
    case = supabase.table("cases") \
        .select("id") \
        .eq("case_id", case_id) \
        .limit(1) \
        .execute()

    case_uuid = case.data[0]["id"] if case.data else None

    # store in DB using UUID
    supabase.table("videos").insert({
        "interview_id": interview_id,
        "case_id": case_uuid,
        "video_url": url
    }).execute()

    return {"url": url}


@router.get("/videos/{case_id}")
def get_videos(case_id: str):

    # convert user case_id → UUID
    case = supabase.table("cases") \
        .select("id") \
        .eq("case_id", case_id) \
        .limit(1) \
        .execute()

    if not case.data:
        return []

    case_uuid = case.data[0]["id"]

    result = supabase.table("videos") \
        .select("*") \
        .eq("case_id", case_uuid) \
        .execute()

    return result.data