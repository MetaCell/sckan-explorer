from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime


# ------------ Data Types for Ingestion ------------
class ConnectivityStatement(BaseModel):
	data: Dict
	reference_uri: str


class DataSnapshot(BaseModel):
	source: int
	datetime: datetime


class ConnectivityStatementData(BaseModel):
	statements: List[ConnectivityStatement]
	snapshot: DataSnapshot
