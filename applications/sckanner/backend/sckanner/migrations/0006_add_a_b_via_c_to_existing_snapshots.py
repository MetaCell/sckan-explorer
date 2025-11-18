from django.db import migrations
import tempfile
import requests
from django.core.files import File

URL = "https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/refs/heads/master/sckan-explorer/json/sckanner-data/hierarchy/sckanner-hierarchy.json"


def add_abviac_to_existing_snapshots(apps, schema_editor):
    DataSnapshot = apps.get_model("sckanner", "DataSnapshot")
    for snapshot in DataSnapshot.objects.all():
        if not snapshot.a_b_via_c_json_file:
            response = requests.get(URL)
            response.raise_for_status()
            with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as tmp_file:
                tmp_file.write(response.content)
                tmp_file.flush()
                with open(tmp_file.name, "rb") as f:
                    snapshot.a_b_via_c_json_file.save(
                        f"a_b_via_c_{snapshot.source.name}_{snapshot.version}.json",
                        File(f),
                        save=True,
                    )


class Migration(migrations.Migration):
    dependencies = [
        ("sckanner", "0005_datasnapshot_a_b_via_c_json_file"),
    ]

    operations = [
        migrations.RunPython(add_abviac_to_existing_snapshots),
    ]
