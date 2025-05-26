from django.db import models
from treebeard.mp_tree import MP_Node
from django.db.models import Q
from django.core.exceptions import ValidationError
# Create your models here.


class DataSource(models.Model):
    id = models.AutoField(primary_key=True)
    reference_uri_key = models.CharField(max_length=255, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    python_code_file_for_statements_retrieval = models.FileField(upload_to='data_sources/retrieval/', help_text="Python file containing structure retrieval code", null=False, blank=False)

    def __str__(self):
        return f"DataSource - {self.name}"
    
    class Meta:
        pass


class DataSnapshotStatus(models.TextChoices):
    """
    This defines the status of the data snapshot
    source of the information comes from the Argo workflow status. 
    """
    TO_START = "to_start"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class DataSnapshotManager(models.Manager):
    def completed(self):
        return self.get_queryset().filter(status=DataSnapshotStatus.COMPLETED).order_by('source__name', '-timestamp')


class DataSnapshot(models.Model):
    id = models.AutoField(primary_key=True)
    timestamp = models.DateTimeField(null=True, blank=True, db_index=True)
    source = models.ForeignKey(DataSource, on_delete=models.CASCADE)
    version = models.CharField(max_length=255, db_index=True)
    status = models.CharField(max_length=255, choices=DataSnapshotStatus.choices, db_index=True, default=DataSnapshotStatus.TO_START)

    objects = DataSnapshotManager()

    def __str__(self):
        return f"DataSnapshot {self.id} - source: {self.source} - version: {self.version}"

    class Meta:
        unique_together = ('source', 'version')
    
    
class ConnectivityStatement(models.Model):
    id = models.AutoField(primary_key=True, db_index=True)
    reference_uri = models.URLField(null=True, blank=True, db_index=True)
    data = models.JSONField()  # Stores the knowledge statement as JSON
    snapshot = models.ForeignKey(DataSnapshot, on_delete=models.CASCADE)

    class Meta:
        # TODO - validation/confirmation needed: make sure that - 
        # connectivity statement - reference_uri is unique for a given source.
        # It can be same for different sources.
        unique_together = ('reference_uri', 'snapshot')

    def __str__(self):
        # conditionally add to the Connectiyt string
        cs_str = f"ConnectivityStatement {self.id} - {self.snapshot.id}" 
        if self.snapshot:
            cs_str += f" - source: {self.snapshot.source} - version: {self.snapshot.version}" if self.snapshot.version else f" - source: {self.snapshot.source}"
        return cs_str
    
