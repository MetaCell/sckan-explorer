from .ingest_datasnapshot_connectivity_statements import (
    ingest_datasnapshot_connectivity_statements,
)
from .ingestion_schemas import ConnectivityStatementData
from sckanner.models import DataSource, DataSnapshot as DataSnapshotModel, DataSnapshotStatus
import logging


class ConnectivityStatementIngestionService:
    def __init__(self, reference_uri_key: str):
        self.reference_uri_key = reference_uri_key

    def run_ingestion(self, source: DataSource, snapshot: DataSnapshotModel):
        """
        Run the ingestion workflow for the given source.
        This method is called by the Argo workflow.
        """
        print(f"Running Connectivity Statement Ingestion for source: {source.name}")
        return self.ingest_data(source, self.reference_uri_key, snapshot)

    def ingest_data(
        self,
        source: DataSource,
        reference_uri_key: str,
        snapshot: DataSnapshotModel
    ):
        """
        Returns True if the ingestion was successful, False otherwise.
        sources: List of names of the source in the sckanner db
        """
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        logger.info(f"Starting Connectivity Statement Ingestion for source: {source.name}")

        print(f"Starting Connectivity Statement Ingestion for source: {source.name}")
        print(f"Using snapshot: {snapshot.id}")
        
        # Call the adapter to extract the statements
        try:
            from .connectivity_statement_adapter import ConnectivityStatementAdapter
            adapter = ConnectivityStatementAdapter(
                source=source, snapshot=snapshot, reference_uri_key=reference_uri_key
            )
            statements = adapter.extract_statements()
            are_statements_successfully_ingested = self._ingest_connectivity_statements_to_db(statements, snapshot)
            print("Ingestion completed")
            return are_statements_successfully_ingested
        except Exception as e:
            print(f"Error ingesting statements: {e}")
            return False

    def _ingest_connectivity_statements_to_db(
        self, statements: ConnectivityStatementData, snapshot: DataSnapshotModel
    ) -> bool:
        try:
            print(f"Ingesting statements now to db")
            ingest_datasnapshot_connectivity_statements(
                cs_data=statements, snapshot=snapshot
            )
            print(f"Statements ingested to db")
            return True
        except Exception as e:
            print(f"Error ingesting statements: {e}")
            return False
