# from .composer_ingestion_script import get_statements_from_composer
# from .neurondm_ingestion_script import get_statements_from_neurondm
from typing import List, Dict
# from sckanner.datatypes import ConnectivityStatement, DataSnapshot, ConnectivityStatementData
from datetime import datetime
from .datatypes import ConnectivityStatementData, DataSnapshotData, ConnectivityStatement
from sckanner.models import DataSnapshotStatus
import os
import importlib.util
import sys


class ConnectivityStatementAdapter:
	def __init__(self, source, snapshot, reference_uri_key: str):
		self.source = source
		self.snapshot = snapshot
		self.reference_uri_key = reference_uri_key

	def _extract_statements(self) -> ConnectivityStatementData:
		file_path = self.source.python_code_file_for_statements_retrival
		return self._parse_and_validate_statements(file_path)

	def _parse_and_validate_statements(self, file_path: str) -> ConnectivityStatementData:
		# Check if the file exists in the media folder
		if os.path.exists(file_path.path):
			# Import the module from the uploaded file
			spec = importlib.util.spec_from_file_location("uploaded_module", file_path.path)
			module = importlib.util.module_from_spec(spec)
			sys.modules["uploaded_module"] = module
			spec.loader.exec_module(module)
			
			# Get statements from the uploaded module
			if hasattr(module, 'get_statements'):
				statements = [
					ConnectivityStatement(
						data=statement,
						reference_uri=statement[self.reference_uri_key]
					)
					for statement in module.get_statements()
				]
				return ConnectivityStatementData(
					statements=statements,
					snapshot=DataSnapshotData(
						source=self.source.id,
						datetime=self.snapshot.timestamp
					)
				)
			else:
				self.snapshot.status = DataSnapshotStatus.FAILED
				self.snapshot.save()
				raise ValueError(f"Uploaded file {file_path} does not contain a get_statements function")
		else:
			self.snapshot.status = DataSnapshotStatus.FAILED
			self.snapshot.save()
			raise ValueError(f"File {file_path} does not exist")
		