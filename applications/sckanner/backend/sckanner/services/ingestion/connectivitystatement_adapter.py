# Task for this file is to - given any source, and input data structure,
# convert the input data structure to the DataSnapshot structure and ConnectivityStatement structure.
# Which can be stored in the database.

from typing import List, Dict, Any, Union
from datetime import datetime

from sckanner.models import DataSource
from sckanner.services.ingestion.source.logging_service import LoggerService
from sckanner.services.ingestion.source.neurondm.neurondm_ingestion_script import get_statements_from_neurondm
from sckanner.services.ingestion.source.composer.composer_ingestion_script import get_statements_from_composer
from sckanner.services.ingestion.db.update_connectivity_statements import update_connectivity_statements
from sckanner.datatypes import ConnectivityStatementData, ConnectivityStatement, DataSnapshot
from rdflib import URIRef, term

logger_service = LoggerService()


def resolve_rdf_objects(data: Any) -> Any:
	"""Recursively resolve all RDF and complex objects to JSON-serializable format."""
	if isinstance(data, (list, tuple)):
		return [resolve_rdf_objects(item) for item in data]
	elif isinstance(data, dict):
		return {key: resolve_rdf_objects(value) for key, value in data.items()}
	elif isinstance(data, set):
		return [resolve_rdf_objects(item) for item in data]
	elif isinstance(data, (URIRef, term.URIRef, term.Literal)):
		return str(data)
	elif hasattr(data, 'region') and hasattr(data, 'layer'):
		# Handle rl objects
		return {
			'region': str(data.region),
			'layer': str(data.layer)
		}
	elif hasattr(data, '__dict__'):
		# Handle other objects with attributes
		return {key: resolve_rdf_objects(value) for key, value in data.__dict__.items()}
	return data


class ConnectivityStatementAdapter:
	def __init__(self, source: str, stdout=None, overwrite: bool = True):
		self.source = source
		self.stdout = stdout
		self.overwrite = overwrite

	def run_ingestion(self):
		if self.source == DataSource.NEURONDM:
			neurondm_statements = self.get_neurondm_data()
			update_connectivity_statements(neurondm_statements, self.source, self.overwrite)
		elif self.source == DataSource.COMPOSER:
			composer_statements = self.get_composer_data(stdout=self.stdout)
			update_connectivity_statements(composer_statements, self.source, self.overwrite)
		else:
			raise ValueError(f"Invalid source: {self.source}")

	def get_neurondm_data(self):
		statements_list = get_statements_from_neurondm(
			logger_service_param=logger_service
		)
		return self._parse_neurondm_data(statements_list)

	def get_composer_data(self, stdout=None):
		statements_list = get_statements_from_composer(
			logger_service_param=logger_service, 
			stdout=stdout
		)
		return self._parse_composer_data(statements_list)

	def _parse_neurondm_data(self, statements: List[Dict]):
		data_snapshot = DataSnapshot(
			source=DataSource.NEURONDM,
			datetime=datetime.now(),
		)
		connectivity_statements = [
			ConnectivityStatement(
				data=resolve_rdf_objects(statement),
				reference_uri=statement["id"]
			)
			for statement in statements
		]

		return ConnectivityStatementData(
			statements=connectivity_statements,
			snapshot=data_snapshot
		)

	def _parse_composer_data(self, statements: List[Dict]):
		data_snapshot = DataSnapshot(
			source=DataSource.COMPOSER,
			datetime=datetime.now(),
		)
		connectivity_statements = [
			ConnectivityStatement(
				data=resolve_rdf_objects(statement),
				reference_uri=statement["reference_uri"]
			)
			for statement in statements
		]
		return ConnectivityStatementData(
			statements=connectivity_statements,
			snapshot=data_snapshot
		)



