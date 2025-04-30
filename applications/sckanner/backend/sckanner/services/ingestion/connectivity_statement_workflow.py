# from cloudharness.workflows import operations, tasks
from sckanner.services.ingestion.connectivitystatement_adapter import ConnectivityStatementAdapter
from sckanner.models import DataSource

class ConnectivityStatementIngestionService:
    def __init__(self, config=None, stdout=None, overwrite: bool = True):
        self.config = config
        self.stdout = stdout
        self.overwrite = overwrite

        # TODO: add argo workflow task
        # self.ingestion_task = tasks.CustomTask(
        #     "ingestion",
        #     "sckanner-ingestion",
        #     resources={"limits": {"nvidia.com/gpu": 1, "cloudharness.io/ingest": 1}},
        # )

    def ingest_data(self, sources: list[DataSource]) -> bool:
            """
            Returns True if the ingestion was successful, False otherwise.
            """
            print("Ingesting data into sckanner")

            # TODO: execute the argo task here. 
            # ingestion_op = operations.PipelineOperation(
            #     "sckanner-ingestion-op-", [self.ingestion_task]
            # )
            # ingestion_op.execute()

            for source in sources:
                adapter = ConnectivityStatementAdapter(source, stdout=self.stdout, overwrite=self.overwrite)
                adapter.run_ingestion()

            print("Ingestion completed")
            return True

