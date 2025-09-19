from django.db import migrations
from django.utils import timezone
from django.core.files import File
import os


def create_neurondm_and_composer_data_sources(apps, schema_editor):
    DataSource = apps.get_model('sckanner', 'DataSource')

    # Create NeuronDM data source

    neuron_source, _ = DataSource.objects.get_or_create(
        name="NeuronDM",
        reference_uri_key="reference_uri",
        python_code_file_for_statements_retrieval=None,
    )
    script_path = os.path.join(os.path.dirname(__file__), 'data', 'neurondm_ingestion_script.py')
    with open(script_path, 'rb') as f:
        neuron_source.python_code_file_for_statements_retrieval.save(
            "neurondm_ingestion_script.py", File(f), save=True
        )
    neuron_source.save()

    # Create Composer data source
    composer_source, _ = DataSource.objects.get_or_create(
        name="Composer",
        reference_uri_key="reference_uri",
        python_code_file_for_statements_retrieval=None,
    )
    script_path = os.path.join(os.path.dirname(__file__), 'data', 'composer_ingestion_script.py')
    with open(script_path, 'rb') as f:
        composer_source.python_code_file_for_statements_retrieval.save(
            "composer_ingestion_script.py", File(f), save=True
        )
    composer_source.save()


class Migration(migrations.Migration):
    dependencies = [
        ('sckanner', '0003_connectivitystatement_datasnapshot_datasource_and_more'),
    ]

    operations = [
        migrations.RunPython(create_neurondm_and_composer_data_sources),
    ]
