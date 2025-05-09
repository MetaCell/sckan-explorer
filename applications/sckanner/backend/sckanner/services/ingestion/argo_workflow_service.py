from cloudharness.workflows import operations, tasks
from django.utils import timezone
from sckanner.models import DataSnapshot, DataSnapshotStatus


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
        print(f"Running ingestion workflow for source: {source}")
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
                        "href": op.get_operation_update_url(),
                        "name": submitted.name,
                    }
                },
                202,
            )
        else:
            return "Error submitting operation", 500
