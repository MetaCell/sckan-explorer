import requests
from django.core.management.base import BaseCommand
from sckanner.models import KnowledgeStatement
from django.db import transaction
from typing import Literal
from pydantic import BaseModel
from itertools import batched

DataType = Literal["uri", "literal"]


class Variable(BaseModel):
    type: DataType
    value: str


class Binding(BaseModel):
    Neuron_ID: Variable | None = None
    A_L1_ID: Variable | None = None
    A_L1: Variable | None = None
    A_L2_ID: Variable | None = None
    A_L2: Variable | None = None
    A_L3_ID: Variable | None = None
    A_L3: Variable | None = None
    A_ID: Variable | None = None
    A: Variable | None = None
    C_ID: Variable | None = None
    C: Variable | None = None
    C_Type: Variable | None = None
    B_ID: Variable | None = None
    B: Variable | None = None
    Target_Organ_IRI: Variable | None = None
    Target_Organ: Variable | None = None

    class Config:
        extra = "allow"


class Result(BaseModel):
    bindings: list[Binding]


class Head(BaseModel):
    vars: list[str]


class JsonData(BaseModel):
    head: Head
    results: Result


KNOWLEDGE_STATEMENTS_BATCH_SIZE = 50  # original default value


class Command(BaseCommand):
    help = "Fetch and update knowledge statements from an external server"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting the ingestion process...")

        # Step 1: Fetch raw JSON from external source
        raw_data_url = "https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/master/sckan-explorer/json/a-b-via-c-2.json"
        self.stdout.write(f"Fetching data from {raw_data_url}...")
        response = requests.get(raw_data_url)
        response.raise_for_status()
        raw_data = JsonData(**response.json())

        # Step 2: Extract population IDs
        self.stdout.write("Processing raw data to extract population IDs...")
        population_ids = self.extract_population_ids(raw_data)

        # Step 3: Fetch detailed data for each population ID
        detailed_data = []
        for population_id in batched(population_ids, KNOWLEDGE_STATEMENTS_BATCH_SIZE):
            detailed_data.extend(self.fetch_paginated_data(list(population_id)))

        # Step 4: Update the database in a transactional way
        self.stdout.write("Updating the database...")
        self.update_database(detailed_data)

        self.stdout.write("Ingestion process completed successfully!")

    def extract_population_ids(self, raw_data: JsonData) -> list[str]:
        """
        Process the raw data to extract relevant population IDs.
        """
        return list(
            set(
                [
                    entry.Neuron_ID.value
                    for entry in raw_data.results.bindings
                    if entry.Neuron_ID
                ]
            )
        )

    def fetch_paginated_data(self, population_ids: list[str]):
        """
        Fetch paginated data for a given population ID from the external API.
        """
        detailed_data = []
        detailed_url = f"https://composer.scicrunch.io/api/composer/knowledge-statement/?population_uris={','.join(population_ids)}"
        next_url = detailed_url

        while next_url:
            self.stdout.write(f"Fetching paginated data from {next_url}...")
            response = requests.get(next_url)
            response.raise_for_status()
            data = response.json()

            detailed_data.extend(data.get("results", []))
            next_url = data.get("next")

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