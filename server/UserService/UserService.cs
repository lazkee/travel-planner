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
using Microsoft.ServiceFabric.Services.Runtime;
using UserService.Data;
using UserService.Services;

namespace UserService;

internal sealed class UserService : StatelessService
{
    private const string CorsPolicyName = "TravelPlannerFrontend";
    private const string CorsAllowedOriginsSection = "Cors:AllowedOrigins";

    public UserService(StatelessServiceContext context) : base(context) { }

    protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners() =>
        new[]
        {
            new ServiceInstanceListener(context =>
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
                            services.AddDbContext<UserDbContext>(options =>
                                options.UseSqlServer(ctx.Configuration.GetConnectionString("DefaultConnection"),
                                    sqlOptions => sqlOptions.MigrationsHistoryTable("__UserServiceMigrationsHistory")));

                            services.AddSingleton<IJwtTokenService, JwtTokenService>();
                            services.AddScoped<IAuthService, AuthService>();
                            services.AddScoped<IUserProfileService, UserProfileService>();
                            services.AddScoped<IAdminUserService, AdminUserService>();
                            services.AddScoped<ITravelDataCleanupClient, TravelDataCleanupClient>();
                            services.AddScoped<UserSeeder>();

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
                        .Build()))
        };
}
