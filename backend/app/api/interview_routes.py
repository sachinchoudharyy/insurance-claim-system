from fastapi import APIRouter
from app.services.interview_service import (
    start_interview,
    pause_interview,
    resume_interview,
    end_interview
)

router = APIRouter(prefix="/interview")


@router.post("/start")
def start(data: dict):

    interview = start_interview(
        data["case_id"],
        data.get("category"),
        data["language"],
        data.get("location", {})
    )

    return {
        "id": interview["id"],
        "location_text": interview.get("location_text")
    }


@router.post("/pause/{interview_id}")
def pause(interview_id: str):
    pause_interview(interview_id)
    return {"status": "paused"}


@router.post("/resume/{interview_id}")
def resume(interview_id: str):
    resume_interview(interview_id)
    return {"status": "recording"}


@router.post("/end/{interview_id}")
def end(interview_id: str):
    end_interview(interview_id)
    return {"status": "completed"}


from app.db.supabase_client import supabase


@router.get("/by-case/{case_id}")
def get_interview_by_case(case_id: str):

    result = supabase.table("interviews") \
        .select("*") \
        .eq("case_id", case_id) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    return result.data[0] if result.data else {}