import traceback
import sys

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
        parser.add_argument(
            "--a_b_via_c_json_url",
            type=str,
            default=None,
            help="The URL to the A-B-via-C JSON file",
        )

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting the connectivity statements ingestion django command")
        logger.info("Starting the connectivity statements ingestion django command")

        source_id = kwargs.get("source_id", None)
        snapshot_id = kwargs.get("snapshot_id", None)
        a_b_via_c_json_url = kwargs.get("a_b_via_c_json_url", None)
        logger.info(f"Source ID: {source_id}")
        logger.info(f"Snapshot ID: {snapshot_id}")
        logger.info(f"A-B-via-C JSON URL: {a_b_via_c_json_url}")

        snapshot = None
        try:
            snapshot = self.validate_if_snapshot_exists(snapshot_id)
            source = self.validate_if_source_exists(source_id, snapshot)
            a_b_via_c_json_url = self.validate_if_a_b_via_c_json_url_is_provided(
                a_b_via_c_json_url, snapshot
            )

            # Trigger the ingestion adapter
            ingestion_service = ConnectivityStatementIngestionService(snapshot)
            ingestion_service.download_and_save_a_b_via_c_json_file(a_b_via_c_json_url)
            ingestion_service.run_ingestion(source)
            snapshot = self.update_snapshot_status(
                snapshot, DataSnapshotStatus.COMPLETED
            )
        except Exception as e:
            if snapshot is not None:
                snapshot = self.update_snapshot_status(
                    snapshot,
                    DataSnapshotStatus.FAILED,
                    error_message=f"Error during ingestion: {str(e)}",
                )
            logger.error(f"Error during ingestion: {str(e)}")
            traceback.print_exc()
            sys.exit(1)

    def validate_if_source_exists(self, source_id, snapshot):
        try:
            source = DataSource.objects.get(id=int(source_id))
        except DataSource.DoesNotExist:
            snapshot = self.update_snapshot_status(
                snapshot,
                DataSnapshotStatus.FAILED,
                error_message=f"Invalid source: {source_id}",
            )
            raise ValueError(f"Invalid source: {source_id}")
        return source

    def validate_if_snapshot_exists(self, snapshot_id):
        snapshot = DataSnapshot.objects.get(id=int(snapshot_id))
        if not snapshot:
            raise ValueError(f"Invalid snapshot: {snapshot_id}")
        return snapshot

    def validate_if_reference_uri_key_is_provided(self, reference_uri_key, snapshot):
        if not reference_uri_key:
            snapshot = self.update_snapshot_status(
                snapshot,
                DataSnapshotStatus.FAILED,
                error_message="Reference URI key is required",
            )
            raise ValueError("Reference URI key is required")
        return reference_uri_key

    def validate_if_a_b_via_c_json_url_is_provided(self, a_b_via_c_json_url, snapshot):
        if not a_b_via_c_json_url:
            snapshot = self.update_snapshot_status(
                snapshot,
                DataSnapshotStatus.FAILED,
                error_message="A-B-via-C JSON URL is required",
            )
            raise ValueError("A-B-via-C JSON URL is required")
        return a_b_via_c_json_url

    def update_snapshot_status(self, snapshot, status, error_message=None):
        snapshot.status = status
        if error_message:
            snapshot.message = error_message
        snapshot.save()
        return snapshot
