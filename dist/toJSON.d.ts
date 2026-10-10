/**
 * Error thrown when strict RFC 4180 validation fails.
 * Includes the line and column where the violation was detected.
 */
export declare class CsvParseError extends Error {
    readonly line: number;
    readonly column: number;
    constructor(message: string, line: number, column: number);
}
export interface ToJsonOptions {
    delimiter?: string;
    /** When true, reject CSV that does not conform to the RFC 4180 ABNF grammar. */
    strict?: boolean;
}
export declare function csvToJson(csv: string, delimiterOrOptions?: string | ToJsonOptions): any[];
