from django.db import models, transaction
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
        return self.get_queryset().filter(
            status=DataSnapshotStatus.COMPLETED,
            snapshot_visible=True
        ).order_by('source__name', '-timestamp')
    
    def get_default(self):
        """Get the default snapshot, or None if no default is set"""
        try:
            return self.get(default=True)
        except DataSnapshot.DoesNotExist:
            return None
        except DataSnapshot.MultipleObjectsReturned:
            # This shouldn't happen, but if it does, return the first one and fix the data
            defaults = self.filter(default=True)
            first_default = defaults.first()
            defaults.exclude(pk=first_default.pk).update(default=False)
            return first_default


class DataSnapshot(models.Model):
    id = models.AutoField(primary_key=True)
    timestamp = models.DateTimeField(null=True, blank=True, db_index=True)
    source = models.ForeignKey(DataSource, on_delete=models.CASCADE)
    a_b_via_c_json_file = models.FileField(
        upload_to="a_b_via_c_json/", null=True, blank=True
    )
    version = models.CharField(max_length=255, db_index=True)
    status = models.CharField(max_length=255, choices=DataSnapshotStatus.choices, db_index=True, default=DataSnapshotStatus.TO_START)
    message = models.TextField(null=True, blank=True)
    snapshot_visible = models.BooleanField(default=True, db_index=True, help_text="Whether this snapshot is visible to users")
    default = models.BooleanField(default=False, db_index=True, help_text="Whether this is the default snapshot")

    objects = DataSnapshotManager()

    def save(self, *args, **kwargs):
        # If this snapshot is being set as default, unset all others
        if self.default:
            with transaction.atomic():
                DataSnapshot.objects.exclude(pk=self.pk).update(default=False)
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def clean(self):
        super().clean()
        # Additional validation can be added here if needed
        pass

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
