export default class Node {
  constructor(
    public key: string,
    public name: string,
    public actionName: string,
    public params?: Record<string, any>,
    public config: { labeledInputs?: boolean } = {}
  ) {
    this.key = key;
    this.name = name;
    this.actionName = actionName;
    this.params = params;
  }
}
