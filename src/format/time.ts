const MISSING = "—";

type Moment = string | Date | null | undefined;

function dateOf(moment: Moment): Date | null {
    if (moment === null || moment === undefined || moment === "") return null;
    const date = new Date(moment);
    return Number.isNaN(date.getTime()) ? null : date;
}

function partsOf(date: Date) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((one) => one.type === type)?.value ?? "";
    return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` };
}

export function formatDateTime(moment: Moment): string {
    const date = dateOf(moment);
    if (date === null) return MISSING;
    const parts = partsOf(date);
    return `${parts.date} ${parts.time}`;
}

export function formatDate(moment: Moment): string {
    const date = dateOf(moment);
    return date === null ? MISSING : partsOf(date).date;
}

export function formatTime(moment: Moment): string {
    const date = dateOf(moment);
    return date === null ? MISSING : partsOf(date).time;
}
