from fastapi import APIRouter
from app.services.case_service import create_case, get_cases
from app.models.schemas import CaseCreate

router = APIRouter(prefix="/cases")


@router.post("/create")
def new_case(data: CaseCreate):

    case = create_case(
        data.user_id,
        data.case_id,
        data.claim_type,
        getattr(data, "category", None)
    )

    return case


@router.get("/{user_id}")
def list_cases(user_id: str):

    cases = get_cases(user_id)

    return {"cases": cases}