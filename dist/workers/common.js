"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessBranchResult = exports.PrResult = void 0;
var PrResult;
(function (PrResult) {
    PrResult["AwaitingApproval"] = "AwaitingApproval";
    PrResult["AwaitingGreenBranch"] = "AwaitingGreenBranch";
    PrResult["AwaitingNotPending"] = "AwaitingNotPending";
    PrResult["BlockedByBranchAutomerge"] = "BlockedByBranchAutomerge";
    PrResult["Created"] = "Created";
    PrResult["Error"] = "Error";
    PrResult["ErrorAlreadyExists"] = "ErrorAlreadyExists";
    PrResult["NotUpdated"] = "NotUpdated";
    PrResult["Updated"] = "Updated";
    PrResult["LimitReached"] = "LimitReached";
})(PrResult = exports.PrResult || (exports.PrResult = {}));
var ProcessBranchResult;
(function (ProcessBranchResult) {
    ProcessBranchResult["AlreadyExisted"] = "already-existed";
    ProcessBranchResult["Automerged"] = "automerged";
    ProcessBranchResult["Done"] = "done";
    ProcessBranchResult["Error"] = "error";
    ProcessBranchResult["NeedsApproval"] = "needs-approval";
    ProcessBranchResult["NeedsPrApproval"] = "needs-pr-approval";
    ProcessBranchResult["NotScheduled"] = "not-scheduled";
    ProcessBranchResult["NoWork"] = "no-work";
    ProcessBranchResult["Pending"] = "pending";
    ProcessBranchResult["PrCreated"] = "pr-created";
    ProcessBranchResult["PrEdited"] = "pr-edited";
    ProcessBranchResult["PrLimitReached"] = "pr-limit-reached";
    ProcessBranchResult["CommitLimitReached"] = "commit-limit-reached";
    ProcessBranchResult["BranchLimitReached"] = "branch-limit-reached";
    ProcessBranchResult["Rebase"] = "rebase";
})(ProcessBranchResult = exports.ProcessBranchResult || (exports.ProcessBranchResult = {}));
//# sourceMappingURL=common.js.map