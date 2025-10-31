
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: The ${context.operation} operation at path "${context.path}" was denied by security rules.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is to make the error object more readable in the console
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
