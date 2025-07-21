def filter_datasnapshot_by_if_a_b_via_c_json_file_exists(datasnapshots):
    return [
        snapshot
        for snapshot in datasnapshots
        if snapshot.a_b_via_c_json_file and snapshot.a_b_via_c_json_file.url
    ]
