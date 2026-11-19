import * as React from "react";
import { cn } from "../classNames.js";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
    return (
        <div className="w-full overflow-x-auto">
            <table
                className={cn(
                    "w-full border-collapse text-sm [&_tbody_tr:hover]:bg-accent/40 [&_td]:border-b [&_td]:px-2.5 [&_td]:py-[7px] [&_th]:border-b [&_th]:px-2.5 [&_th]:py-[7px] [&_th]:text-left [&_th]:font-bold",
                    className,
                )}
                {...props}
            />
        </div>
    );
}
