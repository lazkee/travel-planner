using TravelPlanner.Shared.Common;
using UserService.Dtos;

namespace UserService.Services;

public interface IUserProfileService
{
    Task<Result<UserProfileDto>> GetProfileAsync(int userId);
    Task<Result<UserProfileDto>> UpdateProfileAsync(int userId, UpdateUserProfileRequestDto request);
    Task<Result<bool>> DeleteProfileAsync(int userId);
}
