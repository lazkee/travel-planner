using TravelPlanner.Shared.Common;

namespace TravelService.Services;

public interface IUserRoleLookupClient
{
    Task<Result<Dictionary<int, string>>> GetRolesByUserIdsAsync(IEnumerable<int> userIds);
}
