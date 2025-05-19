from django.core.management.base import BaseCommand
from sckanner.services.ingestion.connectivity_statement_ingestion_service import (
    ConnectivityStatementIngestionService,
)
from sckanner.models import DataSource, DataSnapshot, DataSnapshotStatus
from sckanner.services.ingestion.logger_service import logger

class Command(BaseCommand):
    help = "Run the ingestion workflow for Sckanner - works with Argo"

    def add_arguments(self, parser):
        parser.add_argument(
            "--source_id", type=int, default=None, help="The source to ingest data from"
        )
        parser.add_argument(
            "--reference_uri_key",
            type=str,
            default=None,
            help="The reference uri key to ingest data from",
        )
        parser.add_argument(
            "--snapshot_id",
            type=int,
            default=None,
            help="The snapshot ID to ingest data from",
        )

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting the connectivity statements ingestion django command")
        logger.info("Starting the connectivity statements ingestion django command")

        source_id = kwargs.get("source_id", None)
        snapshot_id = kwargs.get("snapshot_id", None)

        logger.info(f"Source ID: {source_id}")
        logger.info(f"Snapshot ID: {snapshot_id}")

        snapshot = None
        try:
            snapshot = self.validate_if_snapshot_exists(snapshot_id)
            source = self.validate_if_source_exists(source_id, snapshot)

            # Trigger the ingestion adapter
            ingestion_service = ConnectivityStatementIngestionService()
            is_successful = ingestion_service.run_ingestion(source, snapshot)
            if is_successful:
                snapshot = self.update_snapshot_status(snapshot, DataSnapshotStatus.COMPLETED)
            else:
                snapshot = self.update_snapshot_status(snapshot, DataSnapshotStatus.FAILED)
        except Exception as e:
            if snapshot is not None:
                snapshot = self.update_snapshot_status(snapshot, DataSnapshotStatus.FAILED)
            logger.error(f"Error during ingestion: {str(e)}")
            raise e

    def validate_if_source_exists(self, source_id, snapshot):
        try:
            source = DataSource.objects.get(id=int(source_id))
        except DataSource.DoesNotExist:
            snapshot = self.update_snapshot_status(snapshot, DataSnapshotStatus.FAILED)
            raise ValueError(f"Invalid source: {source_id}")
        return source

    def validate_if_snapshot_exists(self, snapshot_id):
        snapshot = DataSnapshot.objects.get(id=int(snapshot_id))
        if not snapshot:
            raise ValueError(f"Invalid snapshot: {snapshot_id}")        
        return snapshot

    def validate_if_reference_uri_key_is_provided(self, reference_uri_key, snapshot):
        if not reference_uri_key:
            snapshot = self.update_snapshot_status(snapshot, DataSnapshotStatus.FAILED)
            raise ValueError("Reference URI key is required")
        return reference_uri_key

    def update_snapshot_status(self, snapshot, status):
        snapshot.status = status
        snapshot.save()
        return snapshot