using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Services;

public class ChecklistItemService : IChecklistItemService
{
    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITravelPlanOwnershipValidator _ownershipValidator;

    public ChecklistItemService(TravelDbContext context, IMapper mapper, ITravelPlanOwnershipValidator ownershipValidator)
    {
        _context = context;
        _mapper = mapper;
        _ownershipValidator = ownershipValidator;
    }

    public async Task<Result<List<ChecklistItemDto>>> GetForPlanAsync(int userId, int planId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<List<ChecklistItemDto>>.Failure(planError);

        var items = await _context.ChecklistItems
            .Where(c => c.TravelPlanId == planId)
            .ToListAsync();

        return Result<List<ChecklistItemDto>>.Success(_mapper.Map<List<ChecklistItemDto>>(items));
    }

    public async Task<Result<ChecklistItemDto>> GetByIdAsync(int userId, int planId, int checklistItemId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ChecklistItemDto>.Failure(planError);

        var item = await _context.ChecklistItems
            .FirstOrDefaultAsync(c => c.Id == checklistItemId && c.TravelPlanId == planId);

        if (item == null)
            return Result<ChecklistItemDto>.Failure(TravelServiceErrors.ChecklistItemErrors.NotFound);

        return Result<ChecklistItemDto>.Success(_mapper.Map<ChecklistItemDto>(item));
    }

    public async Task<Result<ChecklistItemDto>> CreateAsync(int userId, int planId, ChecklistItemRequestDto request)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ChecklistItemDto>.Failure(planError);

        if (string.IsNullOrWhiteSpace(request.Text))
            return Result<ChecklistItemDto>.Failure(TravelServiceErrors.ChecklistItemErrors.EmptyText);

        var item = _mapper.Map<ChecklistItem>(request);
        item.TravelPlanId = planId;

        _context.ChecklistItems.Add(item);
        await _context.SaveChangesAsync();

        return Result<ChecklistItemDto>.Success(_mapper.Map<ChecklistItemDto>(item));
    }

    public async Task<Result<ChecklistItemDto>> UpdateAsync(int userId, int planId, int checklistItemId, ChecklistItemRequestDto request)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ChecklistItemDto>.Failure(planError);

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

    public async Task<Result<bool>> DeleteAsync(int userId, int planId, int checklistItemId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<bool>.Failure(planError);

        var item = await _context.ChecklistItems
            .FirstOrDefaultAsync(c => c.Id == checklistItemId && c.TravelPlanId == planId);

        if (item == null)
            return Result<bool>.Failure(TravelServiceErrors.ChecklistItemErrors.NotFound);

        _context.ChecklistItems.Remove(item);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }
}