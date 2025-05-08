"""
NOTE: this file is used to make the ingestion for the composer/SCKAN source. 
For now we use the knowledge_statements public endpoint to get the statements data. 
"""
import logging
# from sckanner.services.ingestion.source.logging_service import LoggerService, AXIOM_NOT_FOUND
from typing import Optional, Literal
from pydantic import BaseModel
import requests
from itertools import batched

logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
RED_COLOR = "\033[91m"
RESET_COLOR = "\033[0m"


# ------------ define the data structure ------------
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

# ------------ end of data structure definition ------------

DEV_POPULATION_LIMIT = 3
KNOWLEDGE_STATEMENTS_BATCH_SIZE = 50
COMPOSER_KNOWLEDGE_STATEMENTS_URL = "https://composer.sckan.stage.metacell.us/api/composer/knowledge-statement/"
# COMPOSER_KNOWLEDGE_STATEMENTS_URL = "https://composer.scicrunch.io/api/composer/knowledge-statement/"


def log_error(message):
    logger.error(f"{RED_COLOR}{message}{RESET_COLOR}")


def extract_population_ids(raw_data: JsonData) -> list[str]:
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

def fetch_paginated_data(population_ids: list[str], stdout=None):
	"""
	Fetch paginated data for a given population ID from the external API.
	"""
	detailed_data = []
	detailed_url = f"{COMPOSER_KNOWLEDGE_STATEMENTS_URL}?population_uris={','.join(population_ids)}"
	next_url = detailed_url

	while next_url:
		if stdout:
			stdout.write(f"Fetching paginated data from {next_url}...\n")
		response = requests.get(next_url)
		response.raise_for_status()
		data = response.json()

		detailed_data.extend(data.get("results", []))
		
		# Update next_url from the response's pagination info
		next_url = data.get("next")
		if next_url and stdout:
			stdout.write(f"Next page: {next_url}\n")

	return detailed_data


def get_statements(stdout=None):
	try:
		# Step 1: Fetch raw JSON from external source
		raw_data_url = "https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/master/sckan-explorer/json/a-b-via-c-2.json"
		if stdout:
			stdout.write(f"Fetching data from {raw_data_url}...\n")
		response = requests.get(raw_data_url)
		response.raise_for_status()
		raw_data = JsonData(**response.json())

		# Step 2: Extract population IDs
		if stdout:
			stdout.write("Processing raw data to extract population IDs...\n")
		population_ids = extract_population_ids(raw_data)

		# Step 3: Fetch detailed data for each population ID
		detailed_data = []
		for population_id in batched(population_ids, KNOWLEDGE_STATEMENTS_BATCH_SIZE):
			detailed_data.extend(fetch_paginated_data(list(population_id)))

		# --- FIXME - REMOVE THE FOLLOWING - ONLY FOR TESTING LOCALLY ---
		# WE ARE INTENTIONALLY FETCHING very few statements for now.
		# This is to make the ingestion process faster and easier to debug.
		# population_ids = population_ids[:DEV_POPULATION_LIMIT]
		# detailed_data = []
		# for population_id in batched(population_ids, 2):
		# 	detailed_data.extend(fetch_paginated_data(list(population_id)))
		# --- FIXME - REMOVE THE ABOVE ---



		if stdout:
			stdout.write(f"Ingestion process completed successfully! Total statements: {len(detailed_data)}\n")

		return detailed_data

	except Exception as e:
		log_error(f"Error fetching statements from {COMPOSER_KNOWLEDGE_STATEMENTS_URL}: {e}")
		raise e


if __name__ == "__main__":
    get_statements()