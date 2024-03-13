import { NodeModel, DefaultPortModel } from '@projectstorm/react-diagrams';
import { NodeTypes } from '../../../models/composer';
import {CustomNodeOptions} from "../GraphDiagram.tsx";

export class CustomNodeModel extends NodeModel {
    customType: NodeTypes;
    name: string;
    externalId: string;
    constructor(customType: NodeTypes, name: string, externalId: string = '',  options: CustomNodeOptions = {}) {
        super({
            ...options,
            type: 'custom',
        });
        this.customType = customType;
        this.name = name;
        this.externalId = externalId;

        if (customType === NodeTypes.Origin || customType === NodeTypes.Via) {
            this.addPort(new DefaultPortModel(false, 'out', 'Out'));
        }
        if (customType === NodeTypes.Via || customType === NodeTypes.Destination) {
            this.addPort(new DefaultPortModel(true, 'in', 'In'));
        }
    }

    getCustomType() {
        return this.customType;
    }

    getOptions(): CustomNodeOptions {
        return super.getOptions() as CustomNodeOptions;
    }
}
