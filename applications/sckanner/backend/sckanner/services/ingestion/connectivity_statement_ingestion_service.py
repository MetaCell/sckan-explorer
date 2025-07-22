from .connectivity_statement_adapter import ConnectivityStatementAdapter
from .ingest_datasnapshot_connectivity_statements import (
    ingest_datasnapshot_connectivity_statements,
)
from sckanner.services.ingestion.logger_service import logger


class ConnectivityStatementIngestionService:

    def __init__(self, snapshot):
        self.snapshot = snapshot

    def download_and_save_a_b_via_c_json_file(self, a_b_via_c_json_url: str) -> str:
        import os
        import tempfile
        import requests
        from django.core.files import File

        shared_dir = "/usr/src/app/persistent/a_b_via_c_json"
        os.makedirs(shared_dir, exist_ok=True)
        filename = f"a_b_via_c_{self.snapshot.source.name}_{self.snapshot.version}.json"

        tmp_file_path = None
        with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as tmp_file:
            response = requests.get(a_b_via_c_json_url)
            if response.status_code != 200:
                tmp_file.close()
                os.remove(tmp_file.name)
                raise Exception(
                    f"Failed to download a_b_via_c_json_file from {a_b_via_c_json_url} (status {response.status_code})"
                )
            tmp_file.write(response.content)
            tmp_file_path = tmp_file.name

            with open(tmp_file_path, "rb") as f:
                self.snapshot.a_b_via_c_json_file = File(f, name=filename)
                self.snapshot.save()

        return tmp_file_path

    def run_ingestion(self, source):
        """
        Run the ingestion workflow for the given source.
        This method is called by the Argo workflow.
        """
        logger.info(f"Running Connectivity Statement Ingestion for source: {source.name}")
        return self.ingest_data(source)

    def ingest_data(self, source):
        logger.info(
            f"Starting Connectivity Statement Ingestion for source: {source.name}"
        )
        logger.info(f"Using snapshot: {self.snapshot.id}")
        try:
            adapter = ConnectivityStatementAdapter(
                source=source, snapshot=self.snapshot
            )
            statements = adapter.extract_statements()
            self._ingest_connectivity_statements_to_db(statements)
            logger.info("Ingestion completed")
        except Exception as e:
            logger.error(f"Error ingesting statements: {e}")
            raise Exception(f"Error ingesting statements: {e}")

    def _ingest_connectivity_statements_to_db(self, statements):

        try:
            logger.info(f"Ingesting statements now to db")
            ingest_datasnapshot_connectivity_statements(
                cs_data=statements, snapshot=self.snapshot
            )
            logger.info(f"Statements ingested to db")
        except Exception as e:
            logger.error(f"Error ingesting statements: {e}")
            raise Exception(f"Error ingesting statements: {e}")
