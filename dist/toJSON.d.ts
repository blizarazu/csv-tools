/**
 * Error thrown when strict RFC 4180 validation fails.
 * Includes the line and column where the violation was detected.
 */
export declare class CsvParseError extends Error {
    readonly line: number;
    readonly column: number;
    constructor(message: string, line: number, column: number);
}
export interface CsvToJsonOptions {
    /** Optional delimiter when the options object is used as the second argument. */
    delimiter?: string;
    /** Preserve leading and trailing spaces in header names. Defaults to false. */
    preserveHeaderSpaces?: boolean;
    /** Preserve leading and trailing spaces in field values. Defaults to false. */
    preserveValueSpaces?: boolean;
    /** When true, reject CSV that does not conform to the RFC 4180 ABNF grammar. */
    strict?: boolean;
}
/** @deprecated Use CsvToJsonOptions. */
export type ToJsonOptions = CsvToJsonOptions;
export declare function csvToJson(csv: string, options?: CsvToJsonOptions): any[];
export declare function csvToJson(csv: string, delimiter?: string, options?: CsvToJsonOptions): any[];
