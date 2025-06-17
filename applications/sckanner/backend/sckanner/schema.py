from ninja import Schema
from typing import Optional
from datetime import datetime
from ninja.orm import create_schema
from sckanner.models import DataSnapshot

class DataSnapshotSchema(Schema):
    id: int
    timestamp: Optional[datetime]
    source_id: int
    source: str
    version: str
