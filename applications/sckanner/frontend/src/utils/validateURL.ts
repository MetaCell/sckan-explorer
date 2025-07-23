import { URLState } from '../context/DataContext';
import { Datasnapshot } from '../models/json';

export const validateURLState = (
	urlState: URLState,
	datasnapshots: Datasnapshot[],
): string[] => {
	const errors: string[] = [];

	// Validate datasnapshot
	if (urlState.datasnapshot) {
		const snapshotExists = datasnapshots.some(
			(ds) => ds.id.toString() === urlState.datasnapshot,
		);
		if (!snapshotExists) {
			const availableIds = datasnapshots
				.map((ds) => ds.id.toString())
				.join(', ');
			errors.push(
				`Invalid data snapshot "${urlState.datasnapshot}". Available snapshots: ${availableIds}`,
			);
		}
	}

	return errors;
};
