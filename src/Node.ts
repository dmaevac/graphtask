export type NodeState = 'pending' | 'started' | 'failed' | 'aborted' | 'succeeded';

export default class Node {
  constructor(
    public key: string,
    public name: string,
    public actionName: string,
    public params?: any,
    public state?: NodeState,
  ) {
    this.key = key;
    this.name = name;
    this.actionName = actionName;
    this.params = params;
    this.state = state;
  }
}
