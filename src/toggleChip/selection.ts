export function toggled(options: readonly string[], value: readonly string[], option: string): string[] {
    const chosen = new Set(value);
    if (chosen.has(option)) chosen.delete(option);
    else chosen.add(option);
    return options.filter((each) => chosen.has(each));
}

export function chosenOf(options: readonly string[], value: readonly string[]): string[] {
    return options.filter((option) => value.includes(option));
}
