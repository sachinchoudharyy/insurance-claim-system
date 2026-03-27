from app.db.supabase_client import supabase
from app.services.location_service import reverse_geocode


def start_interview(case_id, category, language, location):

    latitude = location.get("latitude")
    longitude = location.get("longitude")

    address_text = None

    # reverse geocode if coordinates available
    if latitude and longitude:

        address = reverse_geocode(latitude, longitude)

        address_text = address.get("full_address")

    result = supabase.table("interviews").insert({

        "case_id": case_id,
        "category": category,
        "language": language,

        "latitude": latitude,
        "longitude": longitude,
        "accuracy": location.get("accuracy"),

        "location_text": address_text,

        "status": "recording",
        "full_transcript": ""

    }).execute()

    return result.data[0]


def pause_interview(interview_id):

    supabase.table("interviews") \
        .update({"status": "paused"}) \
        .eq("id", interview_id) \
        .execute()


def resume_interview(interview_id):

    supabase.table("interviews") \
        .update({"status": "recording"}) \
        .eq("id", interview_id) \
        .execute()


from app.services.transcript_service import finalize_transcript

def end_interview(interview_id):

    # mark completed
    supabase.table("interviews") \
        .update({"status": "completed"}) \
        .eq("id", interview_id) \
        .execute()

    # ✅ FORCE QA generation immediately
    finalize_transcript(interview_id)