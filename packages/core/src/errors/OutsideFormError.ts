export class OutsideFormError extends Error {
    constructor(action: string) {
        super(
            `Failed to ${action}. Must be descendant of a <Form/> descendant.`,
        );
        this.name = 'OutsideFormError';
    }
}
