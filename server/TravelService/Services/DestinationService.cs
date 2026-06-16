using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Services;

public class DestinationService : IDestinationService
{
    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITravelPlanOwnershipValidator _ownershipValidator;

    public DestinationService(TravelDbContext context, IMapper mapper, ITravelPlanOwnershipValidator ownershipValidator)
    {
        _context = context;
        _mapper = mapper;
        _ownershipValidator = ownershipValidator;
    }

    public async Task<Result<List<DestinationDto>>> GetForPlanAsync(int userId, int planId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<List<DestinationDto>>.Failure(planError);

        return await GetForPlanAsync(planId);
    }

    public async Task<Result<List<DestinationDto>>> GetForPlanAsync(int planId)
    {
        var planExists = await _context.TravelPlans.AnyAsync(p => p.Id == planId);
        if (!planExists)
            return Result<List<DestinationDto>>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var destinations = await _context.Destinations
            .Where(d => d.TravelPlanId == planId)
            .ToListAsync();

        return Result<List<DestinationDto>>.Success(_mapper.Map<List<DestinationDto>>(destinations));
    }

    public async Task<Result<DestinationDto>> GetByIdAsync(int userId, int planId, int destinationId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<DestinationDto>.Failure(planError);

        return await GetByIdForPlanAsync(planId, destinationId);
    }

    public async Task<Result<DestinationDto>> GetByIdForPlanAsync(int planId, int destinationId)
    {
        var planExists = await _context.TravelPlans.AnyAsync(p => p.Id == planId);
        if (!planExists)
            return Result<DestinationDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == planId);

        if (destination == null)
            return Result<DestinationDto>.Failure(TravelServiceErrors.DestinationErrors.NotFound);

        return Result<DestinationDto>.Success(_mapper.Map<DestinationDto>(destination));
    }

    public async Task<Result<DestinationDto>> CreateAsync(int userId, int planId, DestinationRequestDto request)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<DestinationDto>.Failure(planError);

        return await CreateForPlanAsync(planId, request);
    }

    public async Task<Result<DestinationDto>> CreateForPlanAsync(int planId, DestinationRequestDto request)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);
        if (plan == null)
            return Result<DestinationDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        if (request.DepartureDate < request.ArrivalDate)
            return Result<DestinationDto>.Failure(TravelServiceErrors.DestinationErrors.InvalidDateRange);

        if (!AreDestinationDatesInsideTravelPlan(request, plan))
            return Result<DestinationDto>.Failure(TravelServiceErrors.DestinationErrors.DateOutsideTravelPlan);

        var destination = _mapper.Map<Destination>(request);
        destination.TravelPlanId = planId;

        _context.Destinations.Add(destination);
        await _context.SaveChangesAsync();

        return Result<DestinationDto>.Success(_mapper.Map<DestinationDto>(destination));
    }

    public async Task<Result<DestinationDto>> UpdateAsync(int userId, int planId, int destinationId, DestinationRequestDto request)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<DestinationDto>.Failure(planError);

        return await UpdateForPlanAsync(planId, destinationId, request);
    }

    public async Task<Result<DestinationDto>> UpdateForPlanAsync(int planId, int destinationId, DestinationRequestDto request)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);
        if (plan == null)
            return Result<DestinationDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == planId);

        if (destination == null)
            return Result<DestinationDto>.Failure(TravelServiceErrors.DestinationErrors.NotFound);

        if (request.DepartureDate < request.ArrivalDate)
            return Result<DestinationDto>.Failure(TravelServiceErrors.DestinationErrors.InvalidDateRange);

        if (!AreDestinationDatesInsideTravelPlan(request, plan))
            return Result<DestinationDto>.Failure(TravelServiceErrors.DestinationErrors.DateOutsideTravelPlan);

        _mapper.Map(request, destination);
        await _context.SaveChangesAsync();

        return Result<DestinationDto>.Success(_mapper.Map<DestinationDto>(destination));
    }

    public async Task<Result<bool>> DeleteAsync(int userId, int planId, int destinationId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<bool>.Failure(planError);

        return await DeleteForPlanAsync(planId, destinationId);
    }

    public async Task<Result<bool>> DeleteForPlanAsync(int planId, int destinationId)
    {
        var planExists = await _context.TravelPlans.AnyAsync(p => p.Id == planId);
        if (!planExists)
            return Result<bool>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == planId);

        if (destination == null)
            return Result<bool>.Failure(TravelServiceErrors.DestinationErrors.NotFound);

        _context.Destinations.Remove(destination);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    private static bool AreDestinationDatesInsideTravelPlan(DestinationRequestDto request, TravelPlan plan) =>
        request.ArrivalDate.Date >= plan.StartDate.Date &&
        request.DepartureDate.Date <= plan.EndDate.Date;
}
