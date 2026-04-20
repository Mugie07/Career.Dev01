from pydantic import BaseModel

class JobBase(BaseModel):
    company: str
    role: str
    status: str = "applied"

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    status: str

class Job(JobBase):
    id: int

    class Config:
        from_attributes = True