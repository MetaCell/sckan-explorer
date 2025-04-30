from django.db import transaction
from datetime import datetime
from sckanner.datatypes import ConnectivityStatementData
from sckanner.models import DataSource, DataSnapshot
from typing import Any, Dict, List, Set


# we would like another parameter -- depending on which - we either delete all and then insert, or we update
@transaction.atomic
def update_connectivity_statements(cs_data: ConnectivityStatementData, source: DataSource, overwrite: bool = True):
	"""
	Replace the database content with the new data.
	Transaction ensures the operation is atomic.
	"""
	if overwrite:
		# Delete all existing data
		from sckanner.models import ConnectivityStatement as DBConnectivityStatement
		DBConnectivityStatement.objects.filter(snapshot__source=source).delete()

		snapshot = DataSnapshot.objects.create(source=source, datetime=datetime.now())
		# Insert new data
		DBConnectivityStatement.objects.bulk_create(
			[DBConnectivityStatement(
				data=entry.data,
				reference_uri=entry.reference_uri,
				snapshot=snapshot
			) for entry in cs_data.statements]
		)

	else:
		# TODO: strategy for updating aleady existing data from any given source
		pass

