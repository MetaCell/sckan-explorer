from django.contrib import admin
from .models import ConnectivityStatement, DataSnapshot, DataSource
from django.utils.translation import gettext_lazy as _
from django.contrib import messages
from django.shortcuts import render
from django.urls import reverse
from django import forms
import os
from sckanner.services.ingestion.argo_workflow_service import (
    ArgoWorkflowService,
)
from django.http import HttpResponseRedirect

# Customize admin site
admin.site.site_header = _("Sckanner Administration")
admin.site.site_title = _("Sckanner Admin")
admin.site.index_title = _("Sckanner Administration")


# Create a proxy model for Data Ingestion
class DataIngestion(DataSnapshot):
    class Meta:
        proxy = True
        verbose_name = _("Data Ingestion")
        verbose_name_plural = _("Data Ingestion")


class LatestSnapshotsFilter(admin.SimpleListFilter):
    title = _("Snapshot")
    parameter_name = "snapshot"

    def lookups(self, request, model_admin):
        latest_snapshots = DataSnapshot.objects.order_by("-timestamp")[:4]
        return [(s.id, str(s)) for s in latest_snapshots] + [
            ("all", _("All Snapshots"))
        ]

    def queryset(self, request, queryset):
        if self.value() == "all":
            return queryset
        if self.value():
            return queryset.filter(id=self.value())
        return queryset


class ConnectivityStatementAdmin(admin.ModelAdmin):
    list_filter = ("snapshot__source", LatestSnapshotsFilter)

    def has_add_permission(self, request):
        return False  # Disable manual addition since data comes from ingestion


class DataSnapshotCreateForm(forms.Form):
    source = forms.ModelChoiceField(
        queryset=DataSource.objects.all(), label=_("Source")
    )
    timestamp = forms.DateTimeField(
        label=_("Timestamp"),
        required=False,
        widget=forms.DateTimeInput(attrs={"type": "datetime-local"}),
        help_text=_("Leave blank to use the current time."),
    )
    version = forms.CharField(label=_("Version"), required=False)


class DataSnapshotAdmin(admin.ModelAdmin):
    list_display = ("source", "timestamp", "status")
    ordering = ("-timestamp",)
    exclude = ("status",)

    def add_view(self, request, form_url="", extra_context=None):
        import datetime

        if request.method == "POST":
            form = DataSnapshotCreateForm(request.POST)
            if form.is_valid():
                source = form.cleaned_data["source"]
                timestamp = form.cleaned_data["timestamp"] or datetime.datetime.now()
                version = form.cleaned_data["version"]
                service = ArgoWorkflowService(
                    reference_uri_key=source.reference_uri_key
                )
                service.run_ingestion_workflow(source)
                self.message_user(
                    request, _("Snapshot ingestion started."), messages.SUCCESS
                )
                return HttpResponseRedirect(
                    reverse("admin:sckanner_datasnapshot_changelist")
                )
        else:
            form = DataSnapshotCreateForm()
        context = {
            **self.admin_site.each_context(request),
            "opts": self.model._meta,
            "form": form,
            "title": _("Create data snapshot"),
        }
        return render(
            request, "admin/sckanner/datasnapshot/create_snapshot.html", context
        )

    def change_view(self, request, object_id, form_url="", extra_context=None):
        self.readonly_fields = [f.name for f in self.model._meta.fields]
        extra_context = extra_context or {}
        extra_context["show_delete"] = True
        extra_context["show_save"] = False
        extra_context["show_save_and_add_another"] = False
        extra_context["show_save_and_continue"] = False
        extra_context["show_save_as_new"] = False
        return super().change_view(
            request, object_id, form_url, extra_context=extra_context
        )


class DataSourceForm(forms.ModelForm):
    class Meta:
        model = DataSource
        fields = [
            "name",
            "python_code_file_for_statements_retrival",
            "reference_uri_key",
        ]
        widgets = {
            "python_code_file_for_statements_retrival": forms.ClearableFileInput(
                attrs={"accept": ".py"}
            ),
        }
        help_texts = {
            "python_code_file_for_statements_retrival": "Upload a Python file containing a get_statement() function that returns an array of statements in the format [{}, {}, {}]",
        }

    def clean_python_code_file_for_statements_retrival(self):
        file = self.cleaned_data.get("python_code_file_for_statements_retrival")
        if file:
            ext = os.path.splitext(file.name)[1]
            if ext.lower() != ".py":
                raise forms.ValidationError(
                    "Only Python files are allowed for structure retrieval"
                )
        return file


class DataSourceAdmin(admin.ModelAdmin):
    form = DataSourceForm
    list_display = ("name",)
    ordering = ("name",)
    fields = (
        "name",
        "python_code_file_for_statements_retrival",
        "reference_uri_key",
    )
    help_texts = {
        "python_code_file_for_statements_retrival": "Upload a Python file containing the structure retrieval code",
        "reference_uri_key": "Enter the key for the reference URI field in the data source",
    }


# Register your models here.
admin.site.register(ConnectivityStatement, ConnectivityStatementAdmin)
admin.site.register(DataSnapshot, DataSnapshotAdmin)
admin.site.register(DataSource, DataSourceAdmin)
