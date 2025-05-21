from .ingest_datasnapshot_connectivity_statements import (
    ingest_datasnapshot_connectivity_statements,
)
from .ingestion_schemas import ConnectivityStatementData
from sckanner.models import DataSource, DataSnapshot as DataSnapshotModel, DataSnapshotStatus
from sckanner.services.ingestion.logger_service import logger

class ConnectivityStatementIngestionService:
    def __init__(self):
        pass

    def run_ingestion(self, source: DataSource, snapshot: DataSnapshotModel):
        """
        Returns: True if the ingestion was successful, False otherwise.
        Run the ingestion workflow for the given source.
        This method is called by the Argo workflow.
        """
        logger.info(f"Running Connectivity Statement Ingestion for source: {source.name}")
        return self.ingest_data(source, snapshot)

    def ingest_data(
        self,
        source: DataSource,
        snapshot: DataSnapshotModel
    ):
        """
        Returns True if the ingestion was successful, False otherwise.
        Calls the adapter to extract the statements and 
        then ingests them to the database.
        """
        logger.info(f"Starting Connectivity Statement Ingestion for source: {source.name}")
        logger.info(f"Using snapshot: {snapshot.id}")
        
        # Call the adapter to extract the statements
        try:
            from .connectivity_statement_adapter import ConnectivityStatementAdapter
            adapter = ConnectivityStatementAdapter(
                source=source, snapshot=snapshot
            )
            statements = adapter.extract_statements()
            are_statements_successfully_ingested = self._ingest_connectivity_statements_to_db(statements, snapshot)
            logger.info("Ingestion completed")
            return are_statements_successfully_ingested
        except Exception as e:
            logger.error(f"Error ingesting statements: {e}")
            return False

    def _ingest_connectivity_statements_to_db(
        self, statements: ConnectivityStatementData, snapshot: DataSnapshotModel
    ) -> bool:
        try:
            logger.info(f"Ingesting statements now to db")
            ingest_datasnapshot_connectivity_statements(
                cs_data=statements, snapshot=snapshot
            )
            logger.info(f"Statements ingested to db")
            return True
        except Exception as e:
            logger.error(f"Error ingesting statements: {e}")
            return False
