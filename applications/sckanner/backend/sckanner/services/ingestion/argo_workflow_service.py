from cloudharness.workflows import operations, tasks
from django.utils import timezone
from sckanner.models import DataSnapshot, DataSnapshotStatus, DataSource
from sckanner.services.ingestion.logger_service import logger



class ArgoWorkflowService:
    def __init__(self, timestamp: str, version: str):
        self.timestamp = timestamp
        self.version = version
    

    def run_ingestion_workflow(self, source: DataSource):
        """
        Run the ingestion workflow for the given source.
        This method is called by the Argo workflow.
        """
        logger.info(f"Running ingestion workflow for source: {source}")
        print(f"Running ingestion workflow for source: {source}")

        snapshot = DataSnapshot.objects.create(
            source=source,
            status=DataSnapshotStatus.PENDING,
            version=self.version,
            timestamp=self.timestamp,
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
                        "href": op.get_operation_update_url(),
                        "name": submitted.name,
                    }
                },
                202,
            )
        else:
            logger.error("Error submitting operation")
            return "Error submitting operation", 500
