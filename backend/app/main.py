from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth_routes import router as auth_router
from app.api.case_routes import router as case_router
from app.api.interview_routes import router as interview_router
from app.api.interview_ws import router as interview_ws_router
from app.api.upload_video import router as upload_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(case_router)
app.include_router(interview_router)
app.include_router(interview_ws_router)
app.include_router(upload_router)