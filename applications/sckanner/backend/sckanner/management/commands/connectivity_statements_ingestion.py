from django.core.management.base import BaseCommand
from sckanner.services.ingestion.connectivity_statement_workflow import ConnectivityStatementIngestionService
from sckanner.models import DataSource


class Command(BaseCommand):
    help = "Run the ingestion workflow for Sckanner - works with Argo"

    def add_arguments(self, parser):
        parser.add_argument("--source", type=str, default=None, help="The source to ingest data from")

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting the connectivity statements ingestion process")

        source = kwargs.get("source", None)
        if not source:
            sources = [choice[0] for choice in DataSource.choices]
        else:
            self.validate_if_source_exists(source)
            sources = [source]

        # run the knowledge statements ingestion workflow
        ingestion_service = ConnectivityStatementIngestionService(stdout=self.stdout)
        ingestion_service.ingest_data(sources)


    def validate_if_source_exists(self, source):
        if source not in [choice[0] for choice in DataSource.choices]:
            raise ValueError(f"Invalid source: {source}")
