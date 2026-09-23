export function mergeLoadedForm(current, previous, incoming) {
    const merged = { ...current };
    for (const [key, value] of Object.entries(incoming)) {
        if (key === 'email' || JSON.stringify(current[key]) === JSON.stringify(previous[key])) {
            merged[key] = value;
        }
    }
    return merged;
}
