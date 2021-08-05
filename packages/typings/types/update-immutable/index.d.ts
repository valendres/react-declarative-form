declare module 'update-immutable' {
    export type UpdateTransform = {
        [key: string]: any;
    };

    function update(object: any, transform: any): any;

    export default update;
}
