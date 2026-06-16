using TravelPlanner.Shared.Common;

namespace TravelService.Services;

public interface ISharedAccessValidator
{
    Task<Result<SharedAccessContext>> ValidateReadAccessAsync(string token);
    Task<Result<SharedAccessContext>> ValidateEditAccessAsync(string token);
}
