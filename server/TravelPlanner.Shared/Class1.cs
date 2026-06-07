using Microsoft.ServiceFabric.Services.Remoting;
using TravelPlanner.Shared.Sharing;

namespace TravelPlanner.Shared;

public interface ISharingService : IService
{
    Task<ShareCreateResult> CreateAsync(int travelPlanId, string accessLevel, DateTime expiresAtUtc);
    Task<ShareValidationResult> ValidateAsync(string token);
    Task RevokeAsync(string token);
    Task<int> RevokeForPlanAsync(int travelPlanId);
    Task<List<ShareTokenDto>> GetForPlanAsync(int travelPlanId);
}