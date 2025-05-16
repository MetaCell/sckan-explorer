from django.db import transaction
from .ingestion_schemas import ConnectivityStatementData
from sckanner.models import DataSnapshot
from sckanner.models import ConnectivityStatement as DBConnectivityStatement
from sckanner.services.ingestion.logger_service import logger
# we would like another parameter -- depending on which - we either delete all and then insert, or we update
@transaction.atomic
def ingest_datasnapshot_connectivity_statements(cs_data: ConnectivityStatementData, snapshot: DataSnapshot):
	"""
	Add new connectivity statements to the database - for a given snapshot.
	Transaction ensures the operation is atomic.
	"""
	logger.info(f"Adding connectivity statements to db for source {cs_data.snapshot.source} as snapshot {snapshot.id}")
	logger.info(f"number of statements to ingested as part of snapshot {snapshot.id}: {len(cs_data.statements)}")
	# Insert new data
	DBConnectivityStatement.objects.bulk_create(
		[DBConnectivityStatement(
			data=entry.data,
			reference_uri=entry.reference_uri,
			snapshot=snapshot
		) for entry in cs_data.statements]
	)
