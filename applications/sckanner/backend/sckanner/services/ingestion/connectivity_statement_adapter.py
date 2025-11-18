from sckanner.services.ingestion.ingestion_schemas import (
    ConnectivityStatementData,
    DataSnapshotData,
    ConnectivityStatement,
)
import os
import sys
import json
import importlib.util
from sckanner.services.ingestion.logger_service import logger
from jsonschema import validate, ValidationError


class ConnectivityStatementAdapter:
    def __init__(self, source, snapshot):
        self.source = source
        self.snapshot = snapshot
        self.reference_uri_key = source.reference_uri_key

    def extract_statements(self) -> ConnectivityStatementData:
        file_path = self.source.python_code_file_for_statements_retrieval
        return self._parse_and_validate_statements(file_path)

    def _parse_and_validate_statements(
        self, file_path: str
    ) -> ConnectivityStatementData:
        # Check if the file exists in the media folder
        if not os.path.exists(file_path.path):
            logger.error(f"File {file_path} does not exist")
            raise ValueError(f"File {file_path} does not exist")

        # Import the module from the uploaded file
        spec = importlib.util.spec_from_file_location("uploaded_module", file_path.path)
        module = importlib.util.module_from_spec(spec)
        sys.modules["uploaded_module"] = module

        # NOTE: We are trusting the uploaded file to be a safe and valid file to execute.
        # Something to consider in the future is to sanitize the file before executing it.
        spec.loader.exec_module(module)

        # Get statements from the uploaded module
        if hasattr(module, "get_statements") and callable(module.get_statements):
            # Pass the a_b_via_c_json_file path to get_statements
            a_b_via_c_json_path = self.snapshot.a_b_via_c_json_file.path if self.snapshot.a_b_via_c_json_file else None
            statements = module.get_statements(self.snapshot.version, raw_data_url=a_b_via_c_json_path)
            try:
                # Validate the statements against the schema
                current_path = os.path.dirname(os.path.abspath(__file__))
                schema_path = os.path.join(current_path, 'schemas', 'statement-validator.json')
                if not os.path.exists(schema_path):
                    raise FileNotFoundError(f"Schema file not found at {schema_path}")
                # Load the schema
                with open(schema_path, 'r') as schema_file:
                    schema = json.load(schema_file)
                validate(instance=statements, schema=schema)
                statements = [
                    ConnectivityStatement(
                        data=statement, reference_uri=statement[self.reference_uri_key]
                    )
                    for statement in statements
                ]
            except ValidationError as e:
                logger.error(
                    f"Validation error in statements: {e.message}"
                )
                raise ValueError(f"Validation error in statements: {e.message}")
            return ConnectivityStatementData(
                statements=statements,
                snapshot=DataSnapshotData(
                    source=self.source.id, datetime=self.snapshot.timestamp
                ),
            )
        else:
            logger.error(
                f"Uploaded file {file_path} does not contain a get_statements function"
            )
            raise ValueError(
                f"Uploaded file {file_path} does not contain a get_statements function"
            )
