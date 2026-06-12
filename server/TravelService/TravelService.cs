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
using TravelService.Data;
using TravelService.Mapping;
using TravelService.Services;
using TravelService.Services.Remoting;
using System.Text.Json.Serialization;
using TravelPlanner.Shared.Travel;

namespace TravelService;

internal sealed class TravelService : StatelessService, ITravelDataCleanupService
{
    private readonly ServiceProvider _remotingServiceProvider;

    public TravelService(StatelessServiceContext context) : base(context)
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
                        services.AddControllers()
                            .AddJsonOptions(options =>
                            {
                                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
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
                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.UseSwagger();
                        app.UseSwaggerUI();
                        app.UseEndpoints(endpoints =>
                        {
                            endpoints.MapGet("/api/health", async ctx =>
                                await ctx.Response.WriteAsJsonAsync(new { service = "TravelService", status = "OK" }));
                            endpoints.MapControllers();
                        });
                    })
                    .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                    .UseUrls(url)
                    .Build()));

        return this.CreateServiceRemotingInstanceListeners().Concat(new[] { httpListener });
    }

    public async Task<TravelDataCleanupRemotingResult> DeleteAllForUserAsync(int userId)
    {
        using var scope = _remotingServiceProvider.CreateScope();
        var handler = scope.ServiceProvider.GetRequiredService<ITravelDataCleanupRemotingHandler>();
        return await handler.DeleteAllForUserAsync(userId);
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
        services.AddDbContext<TravelDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.MigrationsHistoryTable("__TravelServiceMigrationsHistory")));

        services.AddAutoMapper(typeof(TravelPlanProfile).Assembly);
        services.AddScoped<ITravelPlanOwnershipValidator, TravelPlanOwnershipValidator>();
        services.AddScoped<ITravelPlanService, TravelPlanService>();
        services.AddScoped<IDestinationService, DestinationService>();
        services.AddScoped<IActivityService, ActivityService>();
        services.AddScoped<IExpenseService, ExpenseService>();
        services.AddScoped<IChecklistItemService, ChecklistItemService>();
        services.AddScoped<IBudgetSummaryService, BudgetSummaryService>();
        services.AddScoped<ISharingClientService, SharingClientService>();
        services.AddScoped<ISharedPlanService, SharedPlanService>();
        services.AddScoped<ISharedEditService, SharedEditService>();
        services.AddScoped<ITravelDataCleanupRemotingHandler, TravelDataCleanupRemotingHandler>();
    }
}
