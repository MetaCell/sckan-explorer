import { NodeModel, DefaultPortModel } from '@projectstorm/react-diagrams';
import { CustomNodeOptions } from '../GraphDiagram';
import { NodeTypes, TypeC11Enum } from '../../../models/composer';

export class CustomNodeModel extends NodeModel {
  customType: NodeTypes;
  name: string;
  externalId: string;
  constructor(
    customType: NodeTypes,
    name: string,
    externalId: string = '',
    options: CustomNodeOptions = {
      forward_connection: [],
    },
  ) {
    super({
      ...options,
      type: 'custom',
    });
    this.customType = customType;
    this.name = name;
    this.externalId = externalId;

    this.configurePorts(customType, options);
  }

  configurePorts(customType: NodeTypes, options: CustomNodeOptions): void {
    // Origin nodes have both in and out ports
    if (customType === NodeTypes.Origin) {
      this.addPort(new DefaultPortModel(true, 'in', 'In'));
      this.addPort(new DefaultPortModel(false, 'out', 'Out'));
    }
    // Via nodes have both in and out ports
    if (customType === NodeTypes.Via) {
      this.addPort(new DefaultPortModel(true, 'in', 'In'));
      this.addPort(new DefaultPortModel(false, 'out', 'Out'));
    }
    // Destination nodes: ports depend on the type of destination
    if (customType === NodeTypes.Destination) {
      if (options.anatomicalType === TypeC11Enum.AfferentT) {
        // Afferent terminals have only an out port
        this.addPort(new DefaultPortModel(false, 'out', 'Out'));
      } else {
        // Other destinations have only an in port
        this.addPort(new DefaultPortModel(true, 'in', 'In'));
      }
    }
  }

  getCustomType() {
    return this.customType;
  }

  getOptions(): CustomNodeOptions {
    return super.getOptions() as CustomNodeOptions;
  }
}
