from app.db.supabase_client import supabase


def create_case(user_id, case_id, claim_type, category=None):

    # check existing cases
    query = supabase.table("cases") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("case_id", case_id) \
        .eq("claim_type", claim_type)

    if claim_type == "motor" and category:
        query = query.eq("category", category)

    existing = query.execute()

    if existing.data:
        return {"error": "Case already exists"}

    # insert new case
    result = supabase.table("cases").insert({
        "user_id": user_id,
        "case_id": case_id,
        "claim_type": claim_type,
        "category": category
    }).execute()

    return result.data[0]


def get_cases(user_id):

    result = supabase.table("cases")\
        .select("*")\
        .eq("user_id", user_id)\
        .execute()

    return result.data


def get_case(case_uuid):

    result = supabase.table("cases")\
        .select("*")\
        .eq("id", case_uuid)\
        .execute()

    return result.data[0]