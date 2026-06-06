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

        var expenses = await _context.Expenses
            .Where(e => e.TravelPlanId == planId)
            .ToListAsync();

        return Result<List<ExpenseDto>>.Success(_mapper.Map<List<ExpenseDto>>(expenses));
    }

    public async Task<Result<ExpenseDto>> GetByIdAsync(int userId, int planId, int expenseId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ExpenseDto>.Failure(planError);

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

        if (request.Amount < 0)
            return Result<ExpenseDto>.Failure(TravelServiceErrors.ExpenseErrors.InvalidAmount);

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

    public async Task<Result<bool>> DeleteAsync(int userId, int planId, int expenseId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<bool>.Failure(planError);

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlanId == planId);

        if (expense == null)
            return Result<bool>.Failure(TravelServiceErrors.ExpenseErrors.NotFound);

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }
}