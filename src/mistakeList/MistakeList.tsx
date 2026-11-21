import type { Mistake } from "../apiClient/apiClient.js";
import { cn } from "../classNames.js";

export function MistakeList({ mistakes, className }: { mistakes: readonly Mistake[]; className?: string }) {
    if (mistakes.length === 0) return null;
    return (
        <ul className={cn("list-disc pl-4", className)}>
            {mistakes.map((mistake, index) => (
                <li key={`${String(index)}:${mistake.code}:${mistake.at ?? ""}`}>
                    {mistake.at !== undefined && <span className="font-medium">{mistake.at}: </span>}
                    {mistake.message} {mistake.fix}
                </li>
            ))}
        </ul>
    );
}
