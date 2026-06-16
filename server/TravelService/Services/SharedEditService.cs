using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public class SharedEditService : ISharedEditService
{
    private readonly ISharedAccessValidator _sharedAccessValidator;
    private readonly ITravelPlanService _travelPlanService;
    private readonly IDestinationService _destinationService;
    private readonly IActivityService _activityService;
    private readonly IExpenseService _expenseService;
    private readonly IChecklistItemService _checklistItemService;

    public SharedEditService(
        ISharedAccessValidator sharedAccessValidator,
        ITravelPlanService travelPlanService,
        IDestinationService destinationService,
        IActivityService activityService,
        IExpenseService expenseService,
        IChecklistItemService checklistItemService)
    {
        _sharedAccessValidator = sharedAccessValidator;
        _travelPlanService = travelPlanService;
        _destinationService = destinationService;
        _activityService = activityService;
        _expenseService = expenseService;
        _checklistItemService = checklistItemService;
    }

    public Task<Result<TravelPlanDto>> UpdateTravelPlanAsync(string token, TravelPlanRequestDto request) =>
        ExecuteWithEditAccessAsync(token, planId => _travelPlanService.UpdateForPlanAsync(planId, request));

    public Task<Result<DestinationDto>> CreateDestinationAsync(string token, DestinationRequestDto request) =>
        ExecuteWithEditAccessAsync(token, planId => _destinationService.CreateForPlanAsync(planId, request));

    public Task<Result<DestinationDto>> UpdateDestinationAsync(string token, int destinationId, DestinationRequestDto request) =>
        ExecuteWithEditAccessAsync(token, planId => _destinationService.UpdateForPlanAsync(planId, destinationId, request));

    public Task<Result<bool>> DeleteDestinationAsync(string token, int destinationId) =>
        ExecuteWithEditAccessAsync(token, planId => _destinationService.DeleteForPlanAsync(planId, destinationId));

    public Task<Result<ActivityDto>> CreateActivityAsync(string token, ActivityRequestDto request) =>
        ExecuteWithEditAccessAsync(token, planId => _activityService.CreateForPlanAsync(planId, request));

    public Task<Result<ActivityDto>> UpdateActivityAsync(string token, int activityId, ActivityRequestDto request) =>
        ExecuteWithEditAccessAsync(token, planId => _activityService.UpdateForPlanAsync(planId, activityId, request));

    public Task<Result<bool>> DeleteActivityAsync(string token, int activityId) =>
        ExecuteWithEditAccessAsync(token, planId => _activityService.DeleteForPlanAsync(planId, activityId));

    public Task<Result<ExpenseDto>> CreateExpenseAsync(string token, ExpenseRequestDto request) =>
        ExecuteWithEditAccessAsync(token, planId => _expenseService.CreateForPlanAsync(planId, request));

    public Task<Result<ExpenseDto>> UpdateExpenseAsync(string token, int expenseId, ExpenseRequestDto request) =>
        ExecuteWithEditAccessAsync(token, planId => _expenseService.UpdateForPlanAsync(planId, expenseId, request));

    public Task<Result<bool>> DeleteExpenseAsync(string token, int expenseId) =>
        ExecuteWithEditAccessAsync(token, planId => _expenseService.DeleteForPlanAsync(planId, expenseId));

    public Task<Result<ChecklistItemDto>> CreateChecklistItemAsync(string token, ChecklistItemRequestDto request) =>
        ExecuteWithEditAccessAsync(token, planId => _checklistItemService.CreateForPlanAsync(planId, request));

    public Task<Result<ChecklistItemDto>> UpdateChecklistItemAsync(string token, int checklistItemId, ChecklistItemRequestDto request) =>
        ExecuteWithEditAccessAsync(token, planId => _checklistItemService.UpdateForPlanAsync(planId, checklistItemId, request));

    public Task<Result<bool>> DeleteChecklistItemAsync(string token, int checklistItemId) =>
        ExecuteWithEditAccessAsync(token, planId => _checklistItemService.DeleteForPlanAsync(planId, checklistItemId));

    private async Task<Result<T>> ExecuteWithEditAccessAsync<T>(
        string token,
        Func<int, Task<Result<T>>> action)
    {
        var accessResult = await _sharedAccessValidator.ValidateEditAccessAsync(token);
        if (accessResult.IsFailure)
            return Result<T>.Failure(accessResult.Error!);

        return await action(accessResult.Value!.TravelPlanId);
    }
}
