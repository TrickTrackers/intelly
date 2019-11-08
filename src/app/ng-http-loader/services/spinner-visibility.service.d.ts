import { Observable } from 'rxjs/Observable';
export declare class SpinnerVisibilityService {
    private _visibilitySubject;
    readonly visibilityObservable: Observable<boolean>;
    show(): void;
    hide(): void;
}
export declare function SpinnerVisibilityServiceFactory(): SpinnerVisibilityService;
export declare let SpinnerVisibilityServiceFactoryProvider: {
    provide: typeof SpinnerVisibilityService;
    useFactory: () => SpinnerVisibilityService;
};
