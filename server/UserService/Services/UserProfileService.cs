using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using UserService.Data;
using UserService.Dtos;
using UserService.Models;

namespace UserService.Services;

public class UserProfileService : IUserProfileService
{
    private readonly UserDbContext _context;
    private readonly ITravelDataCleanupClient _travelDataCleanupClient;

    public UserProfileService(UserDbContext context, ITravelDataCleanupClient travelDataCleanupClient)
    {
        _context = context;
        _travelDataCleanupClient = travelDataCleanupClient;
    }

    public async Task<Result<UserProfileDto>> GetProfileAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return Result<UserProfileDto>.Failure(UserProfileErrors.NotFound);

        return Result<UserProfileDto>.Success(BuildDto(user));
    }

    public async Task<Result<UserProfileDto>> UpdateProfileAsync(int userId, UpdateUserProfileRequestDto request)
    {
        var validationError = ValidateNameAndEmail(request.Name, request.Email);
        if (validationError != null)
            return Result<UserProfileDto>.Failure(validationError);

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return Result<UserProfileDto>.Failure(UserProfileErrors.NotFound);

        var email = NormalizeEmail(request.Email);
        var emailExists = await _context.Users.AnyAsync(u => u.Id != userId && u.Email == email);
        if (emailExists)
            return Result<UserProfileDto>.Failure(UserProfileErrors.EmailAlreadyExists);

        user.Name = request.Name.Trim();
        user.Email = email;
        await _context.SaveChangesAsync();

        return Result<UserProfileDto>.Success(BuildDto(user));
    }

    public async Task<Result<bool>> DeleteProfileAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return Result<bool>.Failure(UserProfileErrors.NotFound);

        var cleanupResult = await _travelDataCleanupClient.DeleteUserTravelDataAsync(userId);
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
            return UserProfileErrors.EmptyName;

        if (string.IsNullOrWhiteSpace(email))
            return UserProfileErrors.EmptyEmail;

        return null;
    }

    private static UserProfileDto BuildDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role,
        CreatedAt = user.CreatedAt
    };

    private static class UserProfileErrors
    {
        public static readonly Error NotFound =
            new("UserProfile.UserNotFound", "User was not found.");

        public static readonly Error EmptyName =
            new("UserProfile.EmptyName", "Name is required.");

        public static readonly Error EmptyEmail =
            new("UserProfile.EmptyEmail", "Email is required.");

        public static readonly Error EmailAlreadyExists =
            new("UserProfile.EmailAlreadyExists", "A user with this email already exists.");
    }
}
