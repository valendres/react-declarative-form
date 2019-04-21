export class UnknownComponentError extends Error {
    constructor(action: string) {
        super(
            `Failed to ${action}. Not a descendant of this <Form/> component.`,
        );
        this.name = 'UnknownComponentError';
    }
}
