using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Services;

public class ExpenseService : IExpenseService
{
    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITravelPlanOwnershipValidator _ownershipValidator;

    public ExpenseService(TravelDbContext context, IMapper mapper, ITravelPlanOwnershipValidator ownershipValidator)
    {
        _context = context;
        _mapper = mapper;
        _ownershipValidator = ownershipValidator;
    }

    public async Task<Result<List<ExpenseDto>>> GetForPlanAsync(int userId, int planId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<List<ExpenseDto>>.Failure(planError);

        return await GetForPlanAsync(planId);
    }

    public async Task<Result<List<ExpenseDto>>> GetForPlanAsync(int planId)
    {
        var planExists = await _context.TravelPlans.AnyAsync(p => p.Id == planId);
        if (!planExists)
            return Result<List<ExpenseDto>>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var expenses = await _context.Expenses
            .Where(e => e.TravelPlanId == planId)
            .ToListAsync();

        return Result<List<ExpenseDto>>.Success(_mapper.Map<List<ExpenseDto>>(expenses));
    }

    public async Task<Result<ExpenseDto>> GetByIdAsync(int userId, int planId, int expenseId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ExpenseDto>.Failure(planError);

        return await GetByIdForPlanAsync(planId, expenseId);
    }

    public async Task<Result<ExpenseDto>> GetByIdForPlanAsync(int planId, int expenseId)
    {
        var planExists = await _context.TravelPlans.AnyAsync(p => p.Id == planId);
        if (!planExists)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlanId == planId);

        if (expense == null)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.NotFound);

        return Result<ExpenseDto>.Success(_mapper.Map<ExpenseDto>(expense));
    }

    public async Task<Result<ExpenseDto>> CreateAsync(int userId, int planId, ExpenseRequestDto request)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ExpenseDto>.Failure(planError);

        return await CreateForPlanAsync(planId, request);
    }

    public async Task<Result<ExpenseDto>> CreateForPlanAsync(int planId, ExpenseRequestDto request)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);
        if (plan == null)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        if (request.Amount < 0)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.InvalidAmount);

        if (!IsExpenseDateInsideTravelPlan(request.Date, plan))
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.DateOutsideTravelPlan);

        if (!Enum.IsDefined(typeof(ExpenseCategory), request.Category))
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.InvalidCategory);

        var expense = _mapper.Map<Expense>(request);
        expense.TravelPlanId = planId;

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return Result<ExpenseDto>.Success(_mapper.Map<ExpenseDto>(expense));
    }

    public async Task<Result<ExpenseDto>> UpdateAsync(int userId, int planId, int expenseId, ExpenseRequestDto request)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ExpenseDto>.Failure(planError);

        return await UpdateForPlanAsync(planId, expenseId, request);
    }

    public async Task<Result<ExpenseDto>> UpdateForPlanAsync(int planId, int expenseId, ExpenseRequestDto request)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);
        if (plan == null)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlanId == planId);

        if (expense == null)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.NotFound);

        if (request.Amount < 0)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.InvalidAmount);

        if (!IsExpenseDateInsideTravelPlan(request.Date, plan))
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.DateOutsideTravelPlan);

        if (!Enum.IsDefined(typeof(ExpenseCategory), request.Category))
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.InvalidCategory);

        _mapper.Map(request, expense);
        await _context.SaveChangesAsync();

        return Result<ExpenseDto>.Success(_mapper.Map<ExpenseDto>(expense));
    }

    public async Task<Result<bool>> DeleteAsync(int userId, int planId, int expenseId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<bool>.Failure(planError);

        return await DeleteForPlanAsync(planId, expenseId);
    }

    public async Task<Result<bool>> DeleteForPlanAsync(int planId, int expenseId)
    {
        var planExists = await _context.TravelPlans.AnyAsync(p => p.Id == planId);
        if (!planExists)
            return Result<bool>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlanId == planId);

        if (expense == null)
            return Result<bool>.Failure(TravelServiceErrors.ExpenseErrors.NotFound);

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    private static bool IsExpenseDateInsideTravelPlan(DateTime expenseDate, TravelPlan plan) =>
        expenseDate.Date >= plan.StartDate.Date && expenseDate.Date <= plan.EndDate.Date;
}
