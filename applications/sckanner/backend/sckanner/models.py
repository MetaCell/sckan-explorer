from django.db import models

# Create your models here.

from django.db import models

class KnowledgeStatement(models.Model):
    id = models.AutoField(primary_key=True)
    data = models.JSONField()  # Stores the knowledge statement as JSON