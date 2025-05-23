import time
from typing import Any, Dict, List
from django.http import HttpRequest
from ninja import NinjaAPI

from sckanner.models import ConnectivityStatement, DataSnapshot, DataSnapshotStatus
from ..exceptions import Http401, Http403
from sckanner.schema import DataSnapshotSchema

api = NinjaAPI(title='sckanner API', version='0.1.0')


@api.exception_handler(Http401)
def unauthorized(request, exc):
    return api.create_response(
        request,
        {'message': 'Unauthorized'},
        status=401,
    )


@api.exception_handler(Http403)
def forbidden(request, exc):
    return api.create_response(
        request,
        {'message': 'Forbidden'},
        status=403,
    )


@api.get('/ping', response={200: float}, tags=['test'])
def ping(request: HttpRequest):
    return time.time()


@api.get('/live', response={200: str}, tags=['test'])
def live(request: HttpRequest):
    return 'OK'


@api.get('/ready', response={200: str}, tags=['test'])
def ready(request: HttpRequest):
    return 'OK'

@api.get('/knowledge-statements', response=List[Dict[str, Any]], tags=['knowledge'])
def get_knowledge_statements(request, datasnapshot_id: int):
    statements = ConnectivityStatement.objects.filter(snapshot_id=datasnapshot_id)
    return [statement.data for statement in statements]  # Directly return the JSON data at the root


@api.get('/datasnapshots', response=List[DataSnapshotSchema], tags=['datasnapshots'])
def get_datasnapshots(request):
    datasnapshots = DataSnapshot.objects.filter(status=DataSnapshotStatus.COMPLETED).order_by('source__name', '-timestamp')
    return [
        DataSnapshotSchema(
            id=snapshot.id,
            timestamp=snapshot.timestamp,
            source_id=snapshot.source.id,
            source=snapshot.source.name,
            version=snapshot.version,
        ) for snapshot in datasnapshots
    ]

