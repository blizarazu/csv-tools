export interface CsvToJsonOptions {
    /** Preserve leading and trailing spaces in header names. Defaults to false. */
    preserveHeaderSpaces?: boolean;
    /** Preserve leading and trailing spaces in field values. Defaults to false. */
    preserveValueSpaces?: boolean;
}
export declare function csvToJson(csv: string, options?: CsvToJsonOptions): any[];
export declare function csvToJson(csv: string, delimiter?: string, options?: CsvToJsonOptions): any[];
