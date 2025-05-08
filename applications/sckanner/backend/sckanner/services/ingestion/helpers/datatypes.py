from typing import List
from pydantic import BaseModel
from typing import Dict
from datetime import datetime


# ------------ Data Types for Migration helper - Ingestion - for COMPOSER and NEURONDM ------------

class ConnectivityStatement(BaseModel):
	data: Dict
	reference_uri: str


class DataSnapshotData(BaseModel):
	source: int
	datetime: datetime


class ConnectivityStatementData(BaseModel):
	statements: List[ConnectivityStatement]
	snapshot: DataSnapshotData

# ------------ End of Data Types for Migration helper - Ingestion - for COMPOSER and NEURONDM ------------

