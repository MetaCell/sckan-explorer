import requests
from django.core.management.base import BaseCommand
from sckanner.models import KnowledgeStatement
from django.db import transaction

class Command(BaseCommand):
    help = "Fetch and update knowledge statements from an external server"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting the ingestion process...")

        # Step 1: Fetch raw JSON from external source
        raw_data_url = "https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/master/sckan-explorer/json/a-b-via-c-2.json"
        self.stdout.write(f"Fetching data from {raw_data_url}...")
        response = requests.get(raw_data_url)
        response.raise_for_status()
        raw_data = response.json()

        # Step 2: Extract population IDs
        self.stdout.write("Processing raw data to extract population IDs...")
        population_ids = self.extract_population_ids(raw_data)
        population_ids = ['http://uri.interlex.org/tgbugs/uris/readable/sparc-nlp/femrep/64']

        # Step 3: Fetch detailed data for each population ID
        detailed_data = []
        for population_id in population_ids:
            detailed_data.extend(self.fetch_paginated_data(population_id))

        # Step 4: Update the database in a transactional way
        self.stdout.write("Updating the database...")
        self.update_database(detailed_data)

        self.stdout.write("Ingestion process completed successfully!")

    def extract_population_ids(self, raw_data):
        """
        Process the raw data to extract relevant population IDs.
        """
        return []
    
    def fetch_paginated_data(self, population_id):
        """
        Fetch paginated data for a given population ID from the external API.
        """
        detailed_data = []
        detailed_url = f"https://composer.scicrunch.io/api/composer/knowledge-statement/?population_uris={population_id}"
        next_url = detailed_url

        while next_url:
            self.stdout.write(f"Fetching paginated data from {next_url}...")
            response = requests.get(next_url)
            response.raise_for_status()
            data = response.json()

            detailed_data.extend(data.get('results', []))
            next_url = data.get('next')

        return detailed_data

    @transaction.atomic
    def update_database(self, detailed_data):
        """
        Replace the database content with the new data.
        Transaction ensures the operation is atomic.
        """
        # Delete all existing data
        KnowledgeStatement.objects.all().delete()

        # Insert new data
        KnowledgeStatement.objects.bulk_create(
            [KnowledgeStatement(data=entry) for entry in detailed_data]
        )