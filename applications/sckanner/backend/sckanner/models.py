from django.db import models
from treebeard.mp_tree import MP_Node
# Create your models here.

from django.db import models

class DataSource(models.TextChoices):
    NEURONDM = "NEURONDM"
    COMPOSER = "COMPOSER"
    

class DataSnapshot(models.Model):
    id = models.AutoField(primary_key=True)
    datetime = models.DateTimeField(null=True, blank=True, db_index=True)
    source = models.CharField(max_length=255, choices=DataSource.choices, db_index=True)

    def __str__(self):
        return f"DataSnapshot {self.id}"

    
    
class ConnectivityStatement(models.Model):
    id = models.AutoField(primary_key=True, db_index=True)
    reference_uri = models.URLField(null=True, blank=True, db_index=True)
    data = models.JSONField()  # Stores the knowledge statement as JSON
    snapshot = models.ForeignKey(DataSnapshot, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('reference_uri', 'snapshot')

    def __str__(self):
        return f"ConnectivityStatement {self.id}"
    
    
    

class EndOrgan(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, db_index=True)

    def __str__(self):
        return f"EndOrgan {self.id}"


class AnatomicalEntityHierarchy(MP_Node):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, db_index=True)

    def __str__(self):
        return f"AnatomicalEntityHierarchy {self.id}"
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, db_index=True)