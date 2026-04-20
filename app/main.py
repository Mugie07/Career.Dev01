from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

from . import models
from . import schemas
from . import crud
from . import database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Job Tracker API")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/")
def home():
    return {"message": "Job Tracker API is running"}

@app.get("/api/jobs")
def get_jobs(db: Session = Depends(get_db)):
    return crud.get_jobs(db)

@app.post("/api/jobs")
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    return crud.create_job(db, job)

@app.put("/api/jobs/{job_id}")
def update_job(job_id: int, job: schemas.JobUpdate, db: Session = Depends(get_db)):
    return crud.update_job(db, job_id, job.status)

@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    return crud.delete_job(db, job_id)

# Serve static files (frontend) - must be mounted AFTER API routes
static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")