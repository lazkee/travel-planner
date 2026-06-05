using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace UserService.Data;

public class UserDbContextFactory : IDesignTimeDbContextFactory<UserDbContext>
{
    public UserDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .Build();

        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseSqlServer(configuration.GetConnectionString("DesignTimeConnection"),
                sqlOptions => sqlOptions.MigrationsHistoryTable("__UserServiceMigrationsHistory"))
            .Options;

        return new UserDbContext(options);
    }
}