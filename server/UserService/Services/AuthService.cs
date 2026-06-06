using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using UserService.Data;
using UserService.Dtos;
using UserService.Models;

namespace UserService.Services;

public class AuthService : IAuthService
{
    private readonly UserDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(UserDbContext context, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterRequestDto request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Email == email))
            return Result<AuthResponseDto>.Failure(new Error(
                "Auth.EmailAlreadyExists",
                "A user with this email already exists."));

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.User,
            CreatedAt = DateTime.Now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Result<AuthResponseDto>.Success(BuildResponse(user));
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Result<AuthResponseDto>.Failure(new Error(
                "Auth.InvalidCredentials",
                "Invalid email or password."));

        return Result<AuthResponseDto>.Success(BuildResponse(user));
    }

    private AuthResponseDto BuildResponse(User user) => new()
    {
        Token = _jwtTokenService.GenerateToken(user),
        UserId = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role.ToString()
    };
}