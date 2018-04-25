export const isDefined = (key: string, values: any) => {
    return (
        key in values &&
        values[key] !== undefined &&
        values[key] !== null &&
        values[key] !== ''
    );
};
