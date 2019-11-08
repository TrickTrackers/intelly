import { OnDestroy, OnInit } from '@angular/core';
import { PendingInterceptorService } from '../../services/pending-interceptor.service';
import { SpinnerVisibilityService } from '../../services/spinner-visibility.service';
export declare class SpinnerComponent implements OnDestroy, OnInit {
    private pendingInterceptorService;
    private spinnerVisibilityService;
    isSpinnerVisible: boolean;
    private subscriptions;
    Spinkit: {
        skChasingDots: string;
        skCubeGrid: string;
        skDoubleBounce: string;
        skRotatingPlane: string;
        skSpinnerPulse: string;
        skThreeBounce: string;
        skWanderingCubes: string;
        skWave: string;
    };
    backgroundColor: string;
    spinner: string;
    filteredUrlPatterns: string[];
    debounceDelay: number;
    entryComponent: any;
    constructor(pendingInterceptorService: PendingInterceptorService, spinnerVisibilityService: SpinnerVisibilityService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private nullifySpinnerIfComponentOutletIsDefined();
    private handleSpinnerVisibility();
    private handleDebounce(hasPendingRequests);
}
