from django.core.management.base import BaseCommand
from sckanner.services.ingestion.helpers.connectivity_statement_workflow import (
    ConnectivityStatementIngestionService,
)
from sckanner.models import DataSource, DataSnapshot, DataSnapshotStatus
import logging

logger = logging.getLogger(__name__)

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
        self.stdout.write("Starting the connectivity statements ingestion process")
        logger.info("Starting the connectivity statements ingestion process")

        source_id = kwargs.get("source_id", None)
        reference_uri_key = kwargs.get("reference_uri_key", None)
        snapshot_id = kwargs.get("snapshot_id", None)

        logger.info(f"Source ID: {source_id}")
        logger.info(f"Reference URI Key: {reference_uri_key}")
        logger.info(f"Snapshot ID: {snapshot_id}")

        snapshot = self.validate_if_snapshot_exists(snapshot_id)
        snapshot.status = DataSnapshotStatus.IN_PROGRESS
        snapshot.save()

        if not source_id:
            self.stdout.write("No source provided, ingesting all sources")
            logger.info("No source provided, ingesting all sources")
            snapshot.status = DataSnapshotStatus.FAILED
            snapshot.save()
            return

        source = self.validate_if_source_exists(source_id, snapshot)

        try:
            # Trigger the ingestion adapter
            ingestion_service = ConnectivityStatementIngestionService(reference_uri_key)
            success = ingestion_service.run_ingestion_workflow(source, snapshot)


        except Exception as e:
            logger.error(f"Error during ingestion: {str(e)}")
            raise e

    def validate_if_source_exists(self, source_id, snapshot):
        source = DataSource.objects.get(id=int(source_id))
        if not source:
            snapshot.status = DataSnapshotStatus.FAILED
            snapshot.save()
            raise ValueError(f"Invalid source: {source_id}")
        return source

    def validate_if_snapshot_exists(self, snapshot_id):
        snapshot = DataSnapshot.objects.get(id=int(snapshot_id))
        if not snapshot:
            raise ValueError(f"Invalid snapshot: {snapshot_id}")        
        return snapshot

