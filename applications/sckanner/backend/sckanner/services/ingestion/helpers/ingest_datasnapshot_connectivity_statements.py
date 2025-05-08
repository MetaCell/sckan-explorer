from django.db import transaction
from .datatypes import ConnectivityStatementData, DataSnapshotData
from sckanner.models import DataSnapshot

# we would like another parameter -- depending on which - we either delete all and then insert, or we update
@transaction.atomic
def ingest_datasnapshot_connectivity_statements(cs_data: ConnectivityStatementData, snapshot: DataSnapshot):
	"""
	Replace the database content with the new data.
	Transaction ensures the operation is atomic.
	cs_data: the statements to be inserted
	source: id of the source in the sckanner db
	overwrite: if True, delete all existing data and insert the new data
	"""
	from sckanner.models import ConnectivityStatement as DBConnectivityStatement
	import logging
	logging.basicConfig(level=logging.INFO)
	logger = logging.getLogger(__name__)
	logger.info(f"Updating connectivity statements for source {cs_data.snapshot.source}")
	print(f"number of statements to ingest: {len(cs_data.statements)}")
	# Insert new data
	DBConnectivityStatement.objects.bulk_create(
		[DBConnectivityStatement(
			data=entry.data,
			reference_uri=entry.reference_uri,
			snapshot=snapshot
		) for entry in cs_data.statements]
	)
