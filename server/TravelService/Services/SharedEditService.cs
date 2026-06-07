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
}