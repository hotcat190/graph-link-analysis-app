from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class CaseCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Tên vụ án")
    description: Optional[str] = Field(None, description="Mô tả vụ án")

class CaseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, description="Tên vụ án mới")
    description: Optional[str] = Field(None, description="Mô tả vụ án mới")

class CaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="UUID của vụ án")
    name: str = Field(..., description="Tên vụ án")
    description: Optional[str] = Field(None, description="Mô tả vụ án")
    createdAt: datetime = Field(..., description="Thời gian tạo vụ án")
