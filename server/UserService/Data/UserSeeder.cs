using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using UserService.Models;

namespace UserService.Data;

public class UserSeeder
{
    private readonly UserDbContext _context;
    private readonly IConfiguration _configuration;

    public UserSeeder(UserDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task SeedDefaultAdminAsync()
    {
        var email = (_configuration["DefaultAdmin:Email"] ?? string.Empty).Trim().ToLowerInvariant();

        if (string.IsNullOrEmpty(email))
            return;

        if (await _context.Users.AnyAsync(u => u.Email == email))
            return;

        var password = _configuration["DefaultAdmin:Password"]
            ?? throw new InvalidOperationException("DefaultAdmin:Password is not configured.");

        var user = new User
        {
            Name = _configuration["DefaultAdmin:Name"] ?? "System Admin",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.Admin,
            CreatedAt = DateTime.Now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }
}