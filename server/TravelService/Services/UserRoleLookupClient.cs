using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared;
using TravelPlanner.Shared.Common;
using TravelService.Common;

namespace TravelService.Services;

public class UserRoleLookupClient : IUserRoleLookupClient
{
    private readonly Uri _userServiceUri;

    public UserRoleLookupClient(IConfiguration configuration)
    {
        _userServiceUri = new Uri(
            configuration["UserService:ServiceUri"]
            ?? throw new InvalidOperationException("UserService:ServiceUri is not configured."));
    }

    public async Task<Result<Dictionary<int, string>>> GetRolesByUserIdsAsync(IEnumerable<int> userIds)
    {
        try
        {
            var distinctUserIds = userIds
                .Where(id => id > 0)
                .Distinct()
                .ToArray();

            if (distinctUserIds.Length == 0)
                return Result<Dictionary<int, string>>.Success(new Dictionary<int, string>());

            var proxy = ServiceProxy.Create<IUserRoleLookupService>(_userServiceUri);
            var response = await proxy.GetRolesByUserIdsAsync(distinctUserIds);

            if (!response.IsSuccess)
                return Result<Dictionary<int, string>>.Failure(new Error(
                    response.ErrorCode ?? TravelServiceErrors.TravelPlanErrors.UserRoleLookupFailed.Code,
                    response.ErrorMessage ?? TravelServiceErrors.TravelPlanErrors.UserRoleLookupFailed.Message));

            var roles = response.Users.ToDictionary(user => user.UserId, user => user.Role);
            return Result<Dictionary<int, string>>.Success(roles);
        }
        catch (Exception ex)
        {
            return Result<Dictionary<int, string>>.Failure(new Error(
                TravelServiceErrors.TravelPlanErrors.UserRoleLookupFailed.Code,
                $"Unable to verify travel plan owner roles: {ex.Message}"));
        }
    }
}
