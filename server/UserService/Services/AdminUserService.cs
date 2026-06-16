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

    public async Task<Result<AdminUserDto>> UpdateAsync(int id, AdminUpdateUserRequestDto request)
    {
        var validationError = ValidateNameAndEmail(request.Name, request.Email);
        if (validationError != null)
            return Result<AdminUserDto>.Failure(validationError);

        if (request.Role.HasValue && !Enum.IsDefined(typeof(UserRole), request.Role.Value))
            return Result<AdminUserDto>.Failure(AdminUserErrors.InvalidRole);

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return Result<AdminUserDto>.Failure(AdminUserErrors.NotFound);

        var email = NormalizeEmail(request.Email);
        var emailExists = await _context.Users.AnyAsync(u => u.Id != id && u.Email == email);
        if (emailExists)
            return Result<AdminUserDto>.Failure(AdminUserErrors.EmailAlreadyExists);

        user.Name = request.Name.Trim();
        user.Email = email;
        if (request.Role.HasValue)
            user.Role = request.Role.Value;

        await _context.SaveChangesAsync();

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

    public async Task<Result<bool>> DeleteAsync(int currentAdminUserId, int id)
    {
        if (currentAdminUserId == id)
            return Result<bool>.Failure(AdminUserErrors.SelfDeleteNotAllowed);

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return Result<bool>.Failure(AdminUserErrors.NotFound);

        var cleanupResult = await _travelDataCleanupClient.DeleteUserTravelDataAsync(id);
        if (cleanupResult.IsFailure)
            return Result<bool>.Failure(cleanupResult.Error!);

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static Error? ValidateNameAndEmail(string name, string email)
    {
        if (string.IsNullOrWhiteSpace(name))
            return AdminUserErrors.EmptyName;

        if (string.IsNullOrWhiteSpace(email))
            return AdminUserErrors.EmptyEmail;

        return null;
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

        public static readonly Error EmptyName =
            new("Admin.EmptyName", "Name is required.");

        public static readonly Error EmptyEmail =
            new("Admin.EmptyEmail", "Email is required.");

        public static readonly Error EmailAlreadyExists =
            new("Admin.EmailAlreadyExists", "A user with this email already exists.");
    }
}
