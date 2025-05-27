from django.utils import timezone
from sckanner.models import DataSnapshot, DataSnapshotStatus, DataSource
from sckanner.services.ingestion.logger_service import logger
from django.conf import settings

from cloudharness.applications import get_current_configuration


def get_volume_directory(current_app) -> str:
    return f"{current_app.harness.deployment.volume.name}:{settings.MEDIA_ROOT}"


class ArgoWorkflowService:
    def __init__(self, timestamp: str, version: str):
        self.timestamp = timestamp
        self.version = version

    def run_ingestion_workflow(self, source: DataSource):
        """
        Run the ingestion workflow for the given source.
        This method is called by the Argo workflow.
        """
        from cloudharness.workflows import operations, tasks

        current_app = get_current_configuration()
        logger.info(f"Running ingestion workflow for source: {source}")

        snapshot = DataSnapshot.objects.create(
            source=source,
            status=DataSnapshotStatus.PENDING,
            version=self.version,
            timestamp=self.timestamp,
        )
        logger.info(f"Running ingestion workflow for source: {source}")
        logger.info(f"Volume directory: {get_volume_directory(current_app)}")
        task_ingestion = tasks.CustomTask(
            "ingestion",
            image_name="sckanner",
            command=[
                "python",
                "manage.py",
                "connectivity_statements_ingestion",
                "--source_id",
                str(source.id),
                "--snapshot_id",
                str(snapshot.id),
            ],
            volume_mounts=[get_volume_directory(current_app)],
        )

        op = operations.PipelineOperation(f"sckanner-ingestion-op-", [task_ingestion])
        wf = op.to_workflow()
        submitted = op.execute()
        if not op.is_error():
            return (
                {
                    "task": {
                        "name": submitted.name,
                    }
                },
                202,
            )
        else:
            logger.error("Error submitting operation")
            return "Error submitting operation", 500
