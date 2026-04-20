from sqlalchemy.orm import Session
from . import models
from . import schemas

def get_jobs(db: Session):
    return db.query(models.JobApplication).all()

def create_job(db: Session, job: schemas.JobCreate):
    db_job = models.JobApplication(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job(db: Session, job_id: int, status: str):
    job = db.query(models.JobApplication).filter(models.JobApplication.id == job_id).first()
    if job:
        job.status = status
        db.commit()
    return job

def delete_job(db: Session, job_id: int):
    job = db.query(models.JobApplication).filter(models.JobApplication.id == job_id).first()
    if job:
        db.delete(job)
        db.commit()
    return job