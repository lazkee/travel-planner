using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using UserService.Data;
using UserService.Dtos;
using UserService.Models;

namespace UserService.Services;

public class AdminUserService : IAdminUserService
{
    private readonly UserDbContext _context;
    private readonly ITravelDataCleanupClient _travelDataCleanupClient;

    public AdminUserService(UserDbContext context, ITravelDataCleanupClient travelDataCleanupClient)
    {
        _context = context;
        _travelDataCleanupClient = travelDataCleanupClient;
    }

    public async Task<Result<List<AdminUserDto>>> GetAllAsync()
    {
        var users = await _context.Users
            .OrderBy(u => u.Id)
            .ToListAsync();

        return Result<List<AdminUserDto>>.Success(users.Select(BuildDto).ToList());
    }

    public async Task<Result<AdminUserDto>> GetByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return Result<AdminUserDto>.Failure(AdminUserErrors.NotFound);

        return Result<AdminUserDto>.Success(BuildDto(user));
    }

    public async Task<Result<AdminUserDto>> UpdateRoleAsync(int id, AdminUpdateUserRoleRequestDto request)
    {
        if (!Enum.IsDefined(typeof(UserRole), request.Role))
            return Result<AdminUserDto>.Failure(AdminUserErrors.InvalidRole);

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return Result<AdminUserDto>.Failure(AdminUserErrors.NotFound);

        user.Role = request.Role;
        await _context.SaveChangesAsync();

        return Result<AdminUserDto>.Success(BuildDto(user));
    }

    public async Task<Result<bool>> DeleteAsync(int currentAdminUserId, int id, string authorizationHeader)
    {
        if (currentAdminUserId == id)
            return Result<bool>.Failure(AdminUserErrors.SelfDeleteNotAllowed);

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return Result<bool>.Failure(AdminUserErrors.NotFound);

        var cleanupResult = await _travelDataCleanupClient.DeleteUserTravelDataAsync(id, authorizationHeader);
        if (cleanupResult.IsFailure)
            return Result<bool>.Failure(cleanupResult.Error!);

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    private static AdminUserDto BuildDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role,
        CreatedAt = user.CreatedAt
    };

    private static class AdminUserErrors
    {
        public static readonly Error NotFound =
            new("Admin.UserNotFound", "User was not found.");

        public static readonly Error SelfDeleteNotAllowed =
            new("Admin.SelfDeleteNotAllowed", "You cannot delete the currently authenticated admin account.");

        public static readonly Error InvalidRole =
            new("Admin.InvalidRole", "User role is invalid.");
    }
}
