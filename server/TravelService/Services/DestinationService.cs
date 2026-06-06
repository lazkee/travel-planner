using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Services;

public class DestinationService : IDestinationService
{
    private static readonly Error PlanNotFoundError =
        new("TravelPlan.NotFound", "Travel plan was not found.");
    private static readonly Error PlanForbiddenError =
        new("TravelPlan.Forbidden", "You are not allowed to access this travel plan.");
    private static readonly Error DestinationNotFoundError =
        new("Destination.NotFound", "Destination was not found.");
    private static readonly Error InvalidDateRangeError =
        new("Destination.InvalidDateRange", "Departure date cannot be before arrival date.");

    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;

    public DestinationService(TravelDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<List<DestinationDto>>> GetForPlanAsync(int userId, int planId)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<List<DestinationDto>>.Failure(planCheck);

        var destinations = await _context.Destinations
            .Where(d => d.TravelPlanId == planId)
            .ToListAsync();

        return Result<List<DestinationDto>>.Success(_mapper.Map<List<DestinationDto>>(destinations));
    }

    public async Task<Result<DestinationDto>> GetByIdAsync(int userId, int planId, int destinationId)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<DestinationDto>.Failure(planCheck);

        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == planId);

        if (destination == null)
            return Result<DestinationDto>.Failure(DestinationNotFoundError);

        return Result<DestinationDto>.Success(_mapper.Map<DestinationDto>(destination));
    }

    public async Task<Result<DestinationDto>> CreateAsync(int userId, int planId, DestinationRequestDto request)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<DestinationDto>.Failure(planCheck);

        if (request.DepartureDate < request.ArrivalDate)
            return Result<DestinationDto>.Failure(InvalidDateRangeError);

        var destination = _mapper.Map<Destination>(request);
        destination.TravelPlanId = planId;

        _context.Destinations.Add(destination);
        await _context.SaveChangesAsync();

        return Result<DestinationDto>.Success(_mapper.Map<DestinationDto>(destination));
    }

    public async Task<Result<DestinationDto>> UpdateAsync(int userId, int planId, int destinationId, DestinationRequestDto request)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<DestinationDto>.Failure(planCheck);

        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == planId);

        if (destination == null)
            return Result<DestinationDto>.Failure(DestinationNotFoundError);

        if (request.DepartureDate < request.ArrivalDate)
            return Result<DestinationDto>.Failure(InvalidDateRangeError);

        _mapper.Map(request, destination);
        await _context.SaveChangesAsync();

        return Result<DestinationDto>.Success(_mapper.Map<DestinationDto>(destination));
    }

    public async Task<Result<bool>> DeleteAsync(int userId, int planId, int destinationId)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<bool>.Failure(planCheck);

        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == planId);

        if (destination == null)
            return Result<bool>.Failure(DestinationNotFoundError);

        _context.Destinations.Remove(destination);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    private async Task<Error?> ValidatePlanOwnershipAsync(int userId, int planId)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);

        if (plan == null) return PlanNotFoundError;
        if (plan.UserId != userId) return PlanForbiddenError;

        return null;
    }
}