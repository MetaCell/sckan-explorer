from ninja import Schema
from typing import Optional
from datetime import datetime
from ninja.orm import create_schema


class DataSnapshotSchema(Schema):
    id: int
    timestamp: Optional[datetime]
    source_id: int
    source: str
    version: str
    a_b_via_c_json_file: str