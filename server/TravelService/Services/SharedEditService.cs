using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Services;

public class SharedEditService : ISharedEditService
{
    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;
    private readonly ISharingClientService _sharingClient;

    public SharedEditService(TravelDbContext context, IMapper mapper, ISharingClientService sharingClient)
    {
        _context = context;
        _mapper = mapper;
        _sharingClient = sharingClient;
    }

    public async Task<Result<TravelPlanDto>> UpdateTravelPlanAsync(string token, TravelPlanRequestDto request)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<TravelPlanDto>.Failure(tokenResult.Error!);

        if (request.EndDate < request.StartDate)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.InvalidDateRange);

        if (request.Budget < 0)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.InvalidBudget);

        var plan = await _context.TravelPlans.FindAsync(tokenResult.Value!.TravelPlanId);
        if (plan == null)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        _mapper.Map(request, plan);
        await _context.SaveChangesAsync();

        return Result<TravelPlanDto>.Success(_mapper.Map<TravelPlanDto>(plan));
    }

    public async Task<Result<DestinationDto>> CreateDestinationAsync(string token, DestinationRequestDto request)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<DestinationDto>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        if (request.DepartureDate < request.ArrivalDate)
            return Result<DestinationDto>.Failure(TravelServiceErrors.DestinationErrors.InvalidDateRange);

        var destination = _mapper.Map<Destination>(request);
        destination.TravelPlanId = planId;

        _context.Destinations.Add(destination);
        await _context.SaveChangesAsync();

        return Result<DestinationDto>.Success(_mapper.Map<DestinationDto>(destination));
    }

    public async Task<Result<DestinationDto>> UpdateDestinationAsync(string token, int destinationId, DestinationRequestDto request)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<DestinationDto>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == planId);

        if (destination == null)
            return Result<DestinationDto>.Failure(TravelServiceErrors.DestinationErrors.NotFound);

        if (request.DepartureDate < request.ArrivalDate)
            return Result<DestinationDto>.Failure(TravelServiceErrors.DestinationErrors.InvalidDateRange);

        _mapper.Map(request, destination);
        await _context.SaveChangesAsync();

        return Result<DestinationDto>.Success(_mapper.Map<DestinationDto>(destination));
    }

    public async Task<Result<bool>> DeleteDestinationAsync(string token, int destinationId)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<bool>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == planId);

        if (destination == null)
            return Result<bool>.Failure(TravelServiceErrors.DestinationErrors.NotFound);

        _context.Destinations.Remove(destination);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    public async Task<Result<ActivityDto>> CreateActivityAsync(string token, ActivityRequestDto request)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<ActivityDto>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        if (request.EstimatedCost < 0)
            return Result<ActivityDto>.Failure(TravelServiceErrors.ActivityErrors.InvalidEstimatedCost);

        var activity = _mapper.Map<TravelActivity>(request);
        activity.TravelPlanId = planId;

        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();

        return Result<ActivityDto>.Success(_mapper.Map<ActivityDto>(activity));
    }

    public async Task<Result<ActivityDto>> UpdateActivityAsync(string token, int activityId, ActivityRequestDto request)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<ActivityDto>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == planId);

        if (activity == null)
            return Result<ActivityDto>.Failure(TravelServiceErrors.ActivityErrors.NotFound);

        if (request.EstimatedCost < 0)
            return Result<ActivityDto>.Failure(TravelServiceErrors.ActivityErrors.InvalidEstimatedCost);

        _mapper.Map(request, activity);
        await _context.SaveChangesAsync();

        return Result<ActivityDto>.Success(_mapper.Map<ActivityDto>(activity));
    }

    public async Task<Result<bool>> DeleteActivityAsync(string token, int activityId)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<bool>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == planId);

        if (activity == null)
            return Result<bool>.Failure(TravelServiceErrors.ActivityErrors.NotFound);

        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    public async Task<Result<ExpenseDto>> CreateExpenseAsync(string token, ExpenseRequestDto request)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<ExpenseDto>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        if (request.Amount < 0)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.InvalidAmount);

        var expense = _mapper.Map<Expense>(request);
        expense.TravelPlanId = planId;

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return Result<ExpenseDto>.Success(_mapper.Map<ExpenseDto>(expense));
    }

    public async Task<Result<ExpenseDto>> UpdateExpenseAsync(string token, int expenseId, ExpenseRequestDto request)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<ExpenseDto>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlanId == planId);

        if (expense == null)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.NotFound);

        if (request.Amount < 0)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.InvalidAmount);

        _mapper.Map(request, expense);
        await _context.SaveChangesAsync();

        return Result<ExpenseDto>.Success(_mapper.Map<ExpenseDto>(expense));
    }

    public async Task<Result<bool>> DeleteExpenseAsync(string token, int expenseId)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<bool>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlanId == planId);

        if (expense == null)
            return Result<bool>.Failure(TravelServiceErrors.ExpenseErrors.NotFound);

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    public async Task<Result<ChecklistItemDto>> CreateChecklistItemAsync(string token, ChecklistItemRequestDto request)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<ChecklistItemDto>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        if (string.IsNullOrWhiteSpace(request.Text))
            return Result<ChecklistItemDto>.Failure(TravelServiceErrors.ChecklistItemErrors.EmptyText);

        var item = _mapper.Map<ChecklistItem>(request);
        item.TravelPlanId = planId;

        _context.ChecklistItems.Add(item);
        await _context.SaveChangesAsync();

        return Result<ChecklistItemDto>.Success(_mapper.Map<ChecklistItemDto>(item));
    }

    public async Task<Result<ChecklistItemDto>> UpdateChecklistItemAsync(string token, int checklistItemId, ChecklistItemRequestDto request)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<ChecklistItemDto>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        var item = await _context.ChecklistItems
            .FirstOrDefaultAsync(c => c.Id == checklistItemId && c.TravelPlanId == planId);

        if (item == null)
            return Result<ChecklistItemDto>.Failure(TravelServiceErrors.ChecklistItemErrors.NotFound);

        if (string.IsNullOrWhiteSpace(request.Text))
            return Result<ChecklistItemDto>.Failure(TravelServiceErrors.ChecklistItemErrors.EmptyText);

        _mapper.Map(request, item);
        await _context.SaveChangesAsync();

        return Result<ChecklistItemDto>.Success(_mapper.Map<ChecklistItemDto>(item));
    }

    public async Task<Result<bool>> DeleteChecklistItemAsync(string token, int checklistItemId)
    {
        var tokenResult = await _sharingClient.ValidateEditShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<bool>.Failure(tokenResult.Error!);

        var planId = tokenResult.Value!.TravelPlanId;

        var item = await _context.ChecklistItems
            .FirstOrDefaultAsync(c => c.Id == checklistItemId && c.TravelPlanId == planId);

        if (item == null)
            return Result<bool>.Failure(TravelServiceErrors.ChecklistItemErrors.NotFound);

        _context.ChecklistItems.Remove(item);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }
}
