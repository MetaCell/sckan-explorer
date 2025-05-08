from cloudharness.workflows import operations, tasks
from django.utils import timezone
from .ingest_datasnapshot_connectivity_statements import (
    ingest_datasnapshot_connectivity_statements,
)
from .datatypes import ConnectivityStatementData, DataSnapshotData
from sckanner.models import DataSource, DataSnapshot as DataSnapshotModel, DataSnapshotStatus
import logging



class ConnectivityStatementIngestionService:
    def __init__(self, reference_uri_key: str):
        self.reference_uri_key = reference_uri_key


    def run_ingestion_workflow(self, source: DataSource, snapshot: DataSnapshotModel):
        """
        Run the ingestion workflow for the given source.
        This method is called by the Argo workflow.
        """
        print(f"Running ingestion workflow for source: {source.name}")
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
        logger.info(f"Starting ingestion for source: {source.name}")

        print(f"Ingesting data into sckanner for source: {source.name}")
        


        print(f"Using snapshot: {snapshot.id}")
        
        from .connectivity_statement_adapter import ConnectivityStatementAdapter

        adapter = ConnectivityStatementAdapter(
            source=source, snapshot=snapshot, reference_uri_key=reference_uri_key
        )
        print(f"Adapter created")
        statements = adapter._extract_statements()
        print(f"Statements extracted")
        success = self._ingest_connectivity_statements_to_db(statements, snapshot)
        print(f"Statements ingested to db")
        print("Ingestion completed")
        snapshot.status = DataSnapshotStatus.COMPLETED
        snapshot.save()
        return success

    def _ingest_connectivity_statements_to_db(
        self, statements: ConnectivityStatementData, snapshot: DataSnapshotModel
    ) -> bool:
        try:
            print(f"Ingesting statements now to db")
            ingest_datasnapshot_connectivity_statements(
                cs_data=statements, snapshot=snapshot
            )
            return True
        except Exception as e:
            print(f"Error ingesting statements: {e}")
            snapshot.status = DataSnapshotStatus.FAILED
            snapshot.save()
            return False
    
