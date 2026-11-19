export interface Choice {
    value: string;
    label: string;
}

export function choicesWith(options: readonly Choice[], value: readonly string[]): Choice[] {
    const known = new Set(options.map((option) => option.value));
    const gone = [...new Set(value)].filter((each) => !known.has(each)).map((each) => ({ value: each, label: each }));
    return [...options, ...gone];
}

export function matching(choices: readonly Choice[], query: string): Choice[] {
    const wanted = query.trim().toLocaleLowerCase();
    return choices.filter((choice) => choice.label.toLocaleLowerCase().includes(wanted));
}

export function toggled(choices: readonly Choice[], value: readonly string[], option: string): string[] {
    const chosen = new Set(value);
    if (chosen.has(option)) chosen.delete(option);
    else chosen.add(option);
    return choices.map((choice) => choice.value).filter((each) => chosen.has(each));
}

export function stepped(shown: readonly Choice[], active: string | null, step: 1 | -1): string | null {
    if (shown.length === 0) return null;
    const at = shown.findIndex((choice) => choice.value === active);
    const next = at === -1 ? (step === 1 ? 0 : shown.length - 1) : (at + step + shown.length) % shown.length;
    return shown[next]?.value ?? null;
}
