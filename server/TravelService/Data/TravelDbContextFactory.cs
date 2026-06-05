using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace TravelService.Data;

public class TravelDbContextFactory : IDesignTimeDbContextFactory<TravelDbContext>
{
    public TravelDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .Build();

        var options = new DbContextOptionsBuilder<TravelDbContext>()
            .UseSqlServer(configuration.GetConnectionString("DesignTimeConnection"),
                sqlOptions => sqlOptions.MigrationsHistoryTable("__TravelServiceMigrationsHistory"))
            .Options;

        return new TravelDbContext(options);
    }
}