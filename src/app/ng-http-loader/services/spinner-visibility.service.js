"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var SpinnerVisibilityService = (function () {
    function SpinnerVisibilityService() {
        this._visibilitySubject = new ReplaySubject_1.ReplaySubject(1);
    }
    Object.defineProperty(SpinnerVisibilityService.prototype, "visibilityObservable", {
        get: function () {
            return this._visibilitySubject.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    SpinnerVisibilityService.prototype.show = function () {
        this._visibilitySubject.next(true);
    };
    SpinnerVisibilityService.prototype.hide = function () {
        this._visibilitySubject.next(false);
    };
    SpinnerVisibilityService.decorators = [
        { type: core_1.Injectable },
    ];
    return SpinnerVisibilityService;
}());
exports.SpinnerVisibilityService = SpinnerVisibilityService;
function SpinnerVisibilityServiceFactory() {
    return new SpinnerVisibilityService();
}
exports.SpinnerVisibilityServiceFactory = SpinnerVisibilityServiceFactory;
exports.SpinnerVisibilityServiceFactoryProvider = {
    provide: SpinnerVisibilityService,
    useFactory: SpinnerVisibilityServiceFactory
};
//# sourceMappingURL=spinner-visibility.service.js.map