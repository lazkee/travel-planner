using System.Fabric;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using TravelPlanner.Shared;
using TravelPlanner.Shared.Users;
using UserService.Data;
using UserService.Services;

namespace UserService;

internal sealed class UserService : StatelessService, IUserRoleLookupService
{
    private const string CorsPolicyName = "TravelPlannerFrontend";
    private const string CorsAllowedOriginsSection = "Cors:AllowedOrigins";

    private readonly ServiceProvider _remotingServiceProvider;

    public UserService(StatelessServiceContext context) : base(context)
    {
        var configuration = BuildConfiguration();
        var services = new ServiceCollection();
        ConfigureBusinessServices(services, configuration);
        _remotingServiceProvider = services.BuildServiceProvider();
    }

    protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
    {
        var httpListener = new ServiceInstanceListener(context =>
            new KestrelCommunicationListener(context, "ServiceEndpoint", (url, listener) =>
                new WebHostBuilder()
                    .UseKestrel()
                    .UseContentRoot(Directory.GetCurrentDirectory())
                    .ConfigureAppConfiguration((ctx, config) =>
                    {
                        config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: false);
                    })
                    .ConfigureServices((ctx, services) =>
                    {
                        var allowedOrigins = ctx.Configuration
                            .GetSection(CorsAllowedOriginsSection)
                            .Get<string[]>() ?? Array.Empty<string>();

                        services.AddControllers();
                        services.AddCors(options =>
                        {
                            options.AddPolicy(CorsPolicyName, policy =>
                            {
                                policy.WithOrigins(allowedOrigins)
                                    .AllowAnyHeader()
                                    .AllowAnyMethod();
                            });
                        });
                        services.AddEndpointsApiExplorer();
                        services.AddSwaggerGen();
                        ConfigureBusinessServices(services, ctx.Configuration);

                        var jwtKey = ctx.Configuration["Jwt:Key"]!;
                        var jwtIssuer = ctx.Configuration["Jwt:Issuer"]!;
                        var jwtAudience = ctx.Configuration["Jwt:Audience"]!;

                        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                            .AddJwtBearer(options =>
                            {
                                options.TokenValidationParameters = new TokenValidationParameters
                                {
                                    ValidateIssuer = true,
                                    ValidateAudience = true,
                                    ValidateLifetime = true,
                                    ValidateIssuerSigningKey = true,
                                    ValidIssuer = jwtIssuer,
                                    ValidAudience = jwtAudience,
                                    IssuerSigningKey = new SymmetricSecurityKey(
                                        Encoding.UTF8.GetBytes(jwtKey))
                                };
                            });

                        services.AddAuthorization();
                    })
                    .Configure(app =>
                    {
                        app.UseRouting();
                        app.UseCors(CorsPolicyName);
                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.UseSwagger();
                        app.UseSwaggerUI();
                        app.UseEndpoints(endpoints =>
                        {
                            endpoints.MapGet("/api/health", async ctx =>
                                await ctx.Response.WriteAsJsonAsync(new { service = "UserService", status = "OK" }));
                            endpoints.MapControllers();
                        });

                        using var scope = app.ApplicationServices.CreateScope();
                        scope.ServiceProvider.GetRequiredService<UserSeeder>()
                            .SeedDefaultAdminAsync().GetAwaiter().GetResult();
                    })
                    .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                    .UseUrls(url)
                    .Build()));

        return this.CreateServiceRemotingInstanceListeners().Concat(new[] { httpListener });
    }

    public async Task<UserRoleLookupRemotingResult> GetRolesByUserIdsAsync(int[] userIds)
    {
        try
        {
            var distinctUserIds = userIds
                .Where(id => id > 0)
                .Distinct()
                .ToArray();

            if (distinctUserIds.Length == 0)
                return new UserRoleLookupRemotingResult { IsSuccess = true };

            using var scope = _remotingServiceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<UserDbContext>();
            var users = await context.Users
                .Where(user => distinctUserIds.Contains(user.Id))
                .Select(user => new UserRoleLookupItemDto
                {
                    UserId = user.Id,
                    Role = user.Role.ToString()
                })
                .ToListAsync();

            return new UserRoleLookupRemotingResult
            {
                IsSuccess = true,
                Users = users
            };
        }
        catch (Exception ex)
        {
            return new UserRoleLookupRemotingResult
            {
                IsSuccess = false,
                ErrorCode = "UserRoleLookup.Failed",
                ErrorMessage = $"User role lookup failed: {ex.Message}"
            };
        }
    }

    protected override async Task OnCloseAsync(CancellationToken cancellationToken)
    {
        _remotingServiceProvider.Dispose();
        await base.OnCloseAsync(cancellationToken);
    }

    protected override void OnAbort()
    {
        _remotingServiceProvider.Dispose();
        base.OnAbort();
    }

    private static IConfigurationRoot BuildConfiguration() =>
        new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
            .Build();

    private static void ConfigureBusinessServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IConfiguration>(configuration);
        services.AddDbContext<UserDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.MigrationsHistoryTable("__UserServiceMigrationsHistory")));

        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserProfileService, UserProfileService>();
        services.AddScoped<IAdminUserService, AdminUserService>();
        services.AddScoped<ITravelDataCleanupClient, TravelDataCleanupClient>();
        services.AddScoped<UserSeeder>();
    }
}
