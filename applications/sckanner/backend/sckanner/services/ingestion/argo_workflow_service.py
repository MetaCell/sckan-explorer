from cloudharness.workflows import operations, tasks
from django.utils import timezone
from sckanner.models import DataSnapshot, DataSnapshotStatus
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ArgoWorkflowService:
    def __init__(self, reference_uri_key: str):
        self.reference_uri_key = reference_uri_key

    def run_ingestion_workflow(self, source: str):
        """
        Run the ingestion workflow for the given source.
        This method is called by the Argo workflow.
        """

        snapshot = DataSnapshot.objects.create(
            source=source,
            status=DataSnapshotStatus.PENDING,
            version="Admin ingestion",
            timestamp=timezone.now(),
        )
        logger.info(f"Running ingestion workflow for source: {source}")
        task_ingestion = tasks.CustomTask(
            "ingestion",
            image_name="sckanner",
            command=[
                "python",
                "manage.py",
                "connectivity_statements_ingestion",
                "--source_id",
                str(source.id),
                "--reference_uri_key",
                self.reference_uri_key,
                "--snapshot_id",
                str(snapshot.id),
            ],
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
