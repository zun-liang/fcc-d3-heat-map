export interface Margin {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

export interface TempData {
    year: number;
    month: number;
    variance: number;
}

export interface Data {
    baseTemperature: number;
    monthlyVariance: TempData[];
}

