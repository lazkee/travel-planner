using TravelPlanner.Shared.Common;
using UserService.Dtos;

namespace UserService.Services;

public interface IAdminUserService
{
    Task<Result<List<AdminUserDto>>> GetAllAsync();
    Task<Result<AdminUserDto>> GetByIdAsync(int id);
    Task<Result<AdminUserDto>> UpdateRoleAsync(int id, AdminUpdateUserRoleRequestDto request);
    Task<Result<bool>> DeleteAsync(int currentAdminUserId, int id, string authorizationHeader);
}
